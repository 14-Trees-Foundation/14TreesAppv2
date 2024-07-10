import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreateTreeRequest, Tree } from '../../model/tree';

const treesTableName='trees';

export class TreesData {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${treesTableName}(
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
            console.log('Trees table created successfully!');
        } catch (error) {
            console.log('error creating trees table:', error);
        }
    };

    deleteTable = async () => {
        const query = `drop table ${treesTableName};`;
        await this.db.executeSql(query);
        console.log("Trees table deleted")
    }

    getTrees = async (offset: number = 0, limit: number = 10, isUploaded?: boolean) => {
        const trees: Tree[] = []
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT * FROM ${treesTableName}
            WHERE change_type != 'delete' ${isUploaded !== undefined ? 'AND' + whereCondition : ""} ORDER BY local_id DESC LIMIT ${limit} OFFSET ${offset};`

        const [results] = await this.db.executeSql(query)
        for (let index = 0; index < results.rows.length; index++) {
            trees.push(results.rows.item(index));
        }

        return trees;
    }



    createTree = async (data: CreateTreeRequest) => {
        const query = `
            INSERT INTO ${treesTableName}
            (name, email, phone, birth_date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `

        const timeStamp = new Date().toISOString();
        const [results] = await this.db.executeSql(query, [
            data.sapling_id, 
            data.tree_location,
            data.tree_type,
            
            timeStamp,
            timeStamp
        ]);
        console.log(JSON.stringify(results))
    }

    updateTree = async (data: Tree) => {
        const now = new Date().toISOString();
        let changeType = 'edit';
       
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${treesTableName} WHERE local_id = ?;`
            [data.local_id]
        )

        if (response.rows.length === 1) {
            const existingTree = response.rows.item(0) as Tree;
            if (existingTree.change_type === 'add') {
                changeType = 'add'
            }
        }

        try {
            await this.db.executeSql(
                `UPDATE ${treesTableName}
                SET
                    name = ?,
                    phone = ?,
                    email = ?,
                    change_type = ?,
                    birth_date = ?,
                    is_uploaded = 0,
                    updated_at = ?
                WHERE local_id = ?;`,
                [data.sapling_id, data.tree_location, data.tree_type, changeType,data.local_id]
            )
        } catch(err: any) {
            console.log(err);
        }
    }


}

