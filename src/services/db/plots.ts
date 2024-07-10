import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreatePlotRequest , Plots } from '../../model/plots';

const plotsTableName = 'plots'

export class UsersData {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${plotsTableName}(
                local_id INTEGER PRIMARY KEY AUTOINCREMENT,
                id INTEGER NULL,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                birth_date TEXT NULL,
                pin TEXT NULL,
                roles TEXT NULL,
                is_uploaded INTEGER DEFAULT 0 CHECK (is_uploaded IN (0, 1)),
                change_type TEXT DEFAULT 'none' CHECK (change_type IN ('none', 'add', 'edit', 'delete')),
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );`;

            await this.db.executeSql(query);
            console.log('Plots table created successfully!');
        } catch (error) {
            console.log('error creating plots table:', error);
        }
    };

    deleteTable = async () => {
        const query = `drop table ${plotsTableName};`;
        await this.db.executeSql(query);
        
    }

    getPlots = async (offset: number = 0, limit: number = 10, isUploaded?: boolean) => {
        const plots: Plots[] = []
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT * FROM ${plotsTableName}
            WHERE change_type != 'delete' ${isUploaded !== undefined ? 'AND' + whereCondition : ""} ORDER BY local_id DESC LIMIT ${limit} OFFSET ${offset};`

        const [results] = await this.db.executeSql(query)
        for (let index = 0; index < results.rows.length; index++) {
          plots.push(results.rows.item(index));
        }

        return plots;
    }


    createPlot = async (data: CreatePlotRequest) => {
        const query = `
            INSERT INTO ${plotsTableName}
            ( name,
              plot_id,
              tags,
              gat,
              status,
              land_type,
              category,
              site_id,
              )
            VALUES (?, ?, ?, ?, ?, ?)
        `

        const timeStamp = new Date().toISOString();
        const [results] = await this.db.executeSql(query, [
            data.name, 
            data.plot_id,
            data.tags,
            data.gat,
            data.status, 
            data.land_type, 
            data.category, 
            data.site_id, 
            timeStamp,
            timeStamp
        ]);
        console.log(JSON.stringify(results))
    }

    updatePlot = async (data: Plots) => {
        const now = new Date().toISOString();
        let changeType = 'edit';
        
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${plotsTableName} WHERE id = ?;`
            [data.id]
        )

        if (response.rows.length === 1) {
            const existingPlot = response.rows.item(0) as Plots;
            if (existingPlot.change_type === 'add') {
                changeType = 'add'
            }
        }

        try {
            await this.db.executeSql(
                `UPDATE ${plotsTableName}
                SET
                    name = ?,
                    plot_id = ?,
                    tags = ?,
                    status = ?,
                    land_type = ?,
                    category = 0,
                    site_id = ?
                WHERE    id = ?;`,
                [data.name, 
                  data.plot_id,
                  data.tags,
                  data.gat,
                  data.status, 
                  data.land_type, 
                  data.category, 
                  data.site_id]
            )
        } catch(err: any) {
            console.log(err);
        }
    }

  
    deletePlot = async (id: number) => {
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${plotsTableName} WHERE id = ?;`
            [id]
        )

        // locally added user: HARD DELETE
        if (response.rows.length === 1) {
            const existingPlot = response.rows.item(0) as Plots;
            if (existingPlot.change_type === 'add') {
                await this.db.executeSql(
                    `DELETE FROM ${plotsTableName} WHERE id = ?;`
                    [id]
                )
            }
        }

        // Live user
        await this.db.executeSql(
            `UPDATE plots
            SET
                is_uploaded = 0,
                change_type = 'delete'
            WHERE id = ?;`,
            [id]
        )
    }


}

