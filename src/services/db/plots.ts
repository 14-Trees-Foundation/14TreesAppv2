import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreatePlotRequest , Plots } from '../../model/plots';


export class PlotsDao {
    private db: SQLiteDatabase;
    private tableName: string = 'plots';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${this.tableName}(
                local_id INTEGER PRIMARY KEY AUTOINCREMENT,
                id INTEGER NULL,
                name TEXT NOT NULL,
                plot_id TEXT NOT NULL,
                
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
        const query = `drop table ${this.tableName};`;
        await this.db.executeSql(query);
        console.log("Plots table deleted")
    }

  // Data manipulation operations
    getPlots = async (offset: number = 0, limit: number = 10, isUploaded?: boolean ,isDeleted: boolean = false) => {
        const plots: Plots[] = []
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query =`SELECT * FROM ${this.tableName}
            WHERE 1=1 ${isDeleted ? '' : ` AND change_type != 'delete'`} ${isUploaded !== undefined ? 'AND ' + whereCondition : ""}
            ORDER BY local_id DESC 
            ${limit < 0 ? '' : `LIMIT ${limit} OFFSET ${offset}`};  `
       
            const [results] = await this.db.executeSql(query)
        for (let index = 0; index < results.rows.length; index++) {
          plots.push(results.rows.item(index));
        }

        return plots;
    }

    countPlotsByChangeTye = async (isUploaded?: boolean): Promise<any> => {
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT change_type, COUNT(*) as count FROM ${this.tableName}
            WHERE ${isUploaded !== undefined ? whereCondition : "1==1"} GROUP BY change_type;`

        const [results] = await this.db.executeSql(query)
        let response: any = {}
        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            response = {
                ...response,
                [row.change_type]: row.count,
            }
        }

        return response;
    }


    createPlot = async (data: CreatePlotRequest) => {
        const query = `
            INSERT INTO ${this.tableName}
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
            `SELECT * FROM ${this.tableName} WHERE id = ?;`
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
                `UPDATE ${this.tableName}
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


    upsertLivePlotIntoLocalDb = async (data: Plots) => {
        if (!data.id) return;

        const [response] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE id = ?;`,
            [data.id]
        )
        if (response.rows.length === 0) {
            // insert live user
            await this.db.executeSql(
                `INSERT INTO ${this.tableName} (
                    id,
                    name,
                    plot_id,
                    tags = ?,
                    
                    change_type,
                    is_uploaded,
                    created_at,
                    updated_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                );`,
                [
                    data.id, data.name, data.plot_id, data.tags,'none', 1, data.created_at, data.updated_at
                ]
            )
        } else {
            // update plot
            await this.db.executeSql(
                `UPDATE ${this.tableName}
                SET
                    name = ?,
                    plot_id = ?,
                    
                    change_type = 'none',
                    is_uploaded = 1,
                    created_at = ?,
                    updated_at = ?
                WHERE id = ?;`,
                [
                    data.name, data.plot_id,data.created_at, data.updated_at, data.id
                ]
            )
        }
    }


  
    deletePlot = async (id: number) => {
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE local_id = ?;`,
            [id]
        )

        if (response.rows.length === 1) {
            const existingPlot = response.rows.item(0) as Plots;

        // locally added plot: HARD DELETE
        if (response.rows.length === 1) {
            const existingPlot = response.rows.item(0) as Plots;
            if (existingPlot.change_type === 'add') {
                await this.db.executeSql(
                    `DELETE FROM ${this.tableName} WHERE local_id = ?;`,
                    [id]
                )
            }else {
                // Live PLot
                await this.db.executeSql(
                    `UPDATE ${this.tableName}
                    SET
                        is_uploaded = 0,
                        change_type = 'delete'
                    WHERE local_id = ?;`,
                    [id]
                )
            }
        }
    
       }
    } 

    deleteLivePlotFromLocalDb = async (id: number) => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE id = ?;`,
            [id]
        )
    }

    deleteLocalPlot = async (id: number) => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE local_id = ?;`,
            [id]
        )
    }

    updatePlotUploadStatus = async (id: number) => {
        const query = `UPDATE ${this.tableName} SET is_uploaded = 1, change_type = 'none' WHERE local_id = ${id};`
        await this.db.executeSql(query)
    }

    getLivePlotIds = async () => {
        const query =  `SELECT id FROM ${this.tableName} WHERE id IS NOT NULL;`
        const [result] = await this.db.executeSql(query);

        const plot_ids: number [] = [];
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            plot_ids.push(row.id);
        }

        return plot_ids;
    }

    searchPlots = async (searchStr: string, offset: number, limit: number) => {
        let plots: Plots[] = [];
        const query =  `
            SELECT * FROM ${this.tableName} 
            WHERE change_type != 'delete' AND (name LIKE ? OR plot_id)
            ORDER BY updated_at DESC
            LIMIT ? OFFSET ?;
        `
        const likeStr = `%${searchStr}%`
        const [results] = await this.db.executeSql(query, [ likeStr, likeStr, limit, offset]);
        for (let index = 0; index < results.rows.length; index++) {
            plots.push(results.rows.item(index));
        }
        return plots;
    }

    getPlotByLiveId = async (id: number) => {
        const query =  `
            SELECT * FROM ${this.tableName} 
            WHERE id = ?;
        `
        const [results] = await this.db.executeSql(query, [id]);
        if (results.rows.length === 1) return results.rows.item(0) as Plots;
        return null;
    }



};
