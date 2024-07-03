import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreateUserRequest, User } from '../../model/user';

const localUsersTableName = 'local_user'
const usersTableName = 'user' // live users (backend service users)

export class UsersData {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTables = async () => {
        const createTable = async (tableName: string) => {
            try {
                const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    email TEXT NOT NULL,
                    birth_date TEXT NULL,
                    is_uploaded INTEGER DEFAULT 0 CHECK (is_uploaded IN (0, 1)),
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );`;
    
                await this.db.executeSql(query);
                console.log(`${tableName} table created successfully!`);
            } catch (error) {
                console.log(`error creating ${tableName} table:`, error);
            }
        };

        await createTable(localUsersTableName);
        await createTable(usersTableName);
    };

    getLocalUsers = async (offset: number = 0, limit: number = 10, isUploaded?: boolean) => {
        const users: User[] = []
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT * FROM ${localUsersTableName}
            WHERE ${isUploaded !== undefined ? whereCondition : "1==1"} OFFSET ${offset} LIMIT ${limit};`

        const [results] = await this.db.executeSql(query)
        for (let index = 0; index < results.rows.length; index++) {
            users.push(results.rows.item(index));
        }

        return users;
    }

    countLocalUsers = async (isUploaded?: boolean): Promise<number> => {
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT COUNT(*) as count FROM ${localUsersTableName}
            WHERE ${isUploaded !== undefined ? whereCondition : "1==1"};`

        const [results] = await this.db.executeSql(query)
        return results.rows.item(0)?.count ?? 0;
    }

    createLocalUser = async (data: CreateUserRequest) => {
        const query = `
            INSERT INTO ${localUsersTableName}
            (name, email, phone, email, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `

        const timeStamp = new Date().toISOString();
        const [results] = await this.db.executeSql(query, [
            data.name, 
            data.email,
            data.phone,
            data.birth_date,
            timeStamp,
            timeStamp
        ]);
        console.log(JSON.stringify(results))
    }

}

