import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreateUserRequest, User } from '../../model/user';

const usersTableName = 'users'

export class UsersData {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${usersTableName}(
                local_id INTEGER PRIMARY KEY AUTOINCREMENT,
                id INTEGER NULL,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                birth_date TEXT NULL,
                is_uploaded INTEGER DEFAULT 0 CHECK (is_uploaded IN (0, 1)),
                change_type TEXT DEFAULT 'none' CHECK (change_type IN ('none', 'add', 'edit', 'delete')),
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );`;

            await this.db.executeSql(query);
            console.log('Users table created successfully!');
        } catch (error) {
            console.log('error creating users table:', error);
        }
    };

    getLocalUsers = async (offset: number = 0, limit: number = 10, isUploaded?: boolean) => {
        const users: User[] = []
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT * FROM ${usersTableName}
            WHERE change_type != 'delete' ${isUploaded !== undefined ? 'AND' + whereCondition : ""} LIMIT ${limit} OFFSET ${offset};`

        const [results] = await this.db.executeSql(query)
        for (let index = 0; index < results.rows.length; index++) {
            users.push(results.rows.item(index));
        }

        return users;
    }

    countLocalUsers = async (isUploaded?: boolean): Promise<number> => {
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT COUNT(*) as count FROM ${usersTableName}
            WHERE ${isUploaded !== undefined ? whereCondition : "1==1"};`

        const [results] = await this.db.executeSql(query)
        return results.rows.item(0)?.count ?? 0;
    }

    createLocalUser = async (data: CreateUserRequest) => {
        const query = `
            INSERT INTO ${usersTableName}
            (name, email, phone, birth_date, created_at, updated_at)
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

    updateLocalUser = async (data: User) => {
        const now = new Date().toISOString();
        let changeType = 'edit';
        const birthDate = data.birth_date?.toISOString() ?? null;
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${usersTableName} WHERE local_id = ?;`
            [data.local_id]
        )

        if (response.rows.length === 1) {
            const existingUser = response.rows.item(0) as User;
            if (existingUser.change_type === 'add') {
                changeType = 'add'
            }
        }

        await this.db.executeSql(
            `UPDATE ${usersTableName}
            SET
                name = ?,
                phone = ?,
                email = ?,
                birth_date = ?,
                is_uploaded = 0,
                change_type = ?,
                updated_at = ?
            WHERE local_id = ?;`,
            [data.name, data.phone, data.email, changeType, birthDate, now, data.local_id]
        )
    }

    upsertLiveUserIntoLocalDb = async (data: User) => {
        if (!data.id) return;
        const birthDate = data.birth_date?.toISOString() ?? null;

        const [response] = await this.db.executeSql(
            `SELECT * FROM ${usersTableName} WHERE id = ?;`
            [data.id]
        )

        if (response.rows.length === 0) {
            // insert live user
            await this.db.executeSql(
                `INSERT INTO ${usersTableName}
                (id, name, email, phone, birth_date, created_at, updated_at, is_uploaded)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [data.id, data.name, data.email, data.phone, birthDate, data.created_at.toISOString(), data.updated_at.toISOString(), 1]
            )
        } else {
            // update user
            await this.db.executeSql(
                `UPDATE ${usersTableName}
                SET
                    name = ?,
                    phone = ?,
                    email = ?,
                    birth_date = ?,
                    is_uploaded = 1,
                    change_type = 'none',
                    created_at = ?,
                    updated_at = ?
                WHERE id = ?;`,
                [data.name, data.phone, data.email, birthDate, data.created_at.toISOString(), data.updated_at.toISOString(), data.id]
            )
        }
    }

    deleteLiveUserFromLocalDb = async (id: number) => {
        await this.db.executeSql(
            `DELETE FROM ${usersTableName} WHERE id = ?;`,
            [id]
        )
    }

    deleteLocalUser = async (id: number) => {
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${usersTableName} WHERE local_id = ?;`
            [id]
        )

        // locally added user: HARD DELETE
        if (response.rows.length === 1) {
            const existingUser = response.rows.item(0) as User;
            if (existingUser.change_type === 'add') {
                await this.db.executeSql(
                    `DELETE FROM ${usersTableName} WHERE local_id = ?;`
                    [id]
                )
            }
        }

        // Live user
        await this.db.executeSql(
            `UPDATE users
            SET
                is_uploaded = 0,
                change_type = 'delete'
            WHERE local_id = ?;`,
            [id]
        )
    }

    updateLocalUserUploadStatus = async (id: number) => {
        const query = `UPDATE ${usersTableName} SET is_uploaded = 1 WHERE local_id = ${id};`
        await this.db.executeSql(query)
    }
}

