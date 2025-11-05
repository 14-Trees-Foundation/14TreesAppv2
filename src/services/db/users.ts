import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreateUserRequest, User } from '../../model/user';

export class UsersDao {
    private db: SQLiteDatabase;
    private tableName: string = 'users';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
                local_id INTEGER PRIMARY KEY AUTOINCREMENT,
                id INTEGER NULL,
                name TEXT NOT NULL,
                phone TEXT NULL,
                email TEXT NULL,
                birth_date TEXT NULL,
                pin TEXT NULL,
                roles TEXT NULL,
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

    deleteTable = async () => {
        const query = `drop table ${this.tableName};`;
        await this.db.executeSql(query);
        console.log("Users table deleted")
    }


    // Data manipulation operations
    getUsers = async (offset: number = 0, limit: number = 10, isUploaded?: boolean, isDeleted: boolean = false) => {
        const users: User[] = []
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT * FROM ${this.tableName}
            WHERE 1=1 ${isDeleted ? '' : ` AND change_type != 'delete'`} ${isUploaded !== undefined ? 'AND ' + whereCondition : ""}
            ORDER BY updated_at DESC 
            ${limit < 0 ? '' : `LIMIT ${limit} OFFSET ${offset}`};
        `

        const results = await this.db.executeSql(query)
        for (let index = 0; index < results.rows.length; index++) {
            users.push(results.rows.item(index));
        }

        return users;
    }

    countUsersByChangeTye = async (isUploaded?: boolean): Promise<any> => {
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT change_type, COUNT(*) as count FROM ${this.tableName}
            WHERE ${isUploaded !== undefined ? whereCondition : "1==1"} GROUP BY change_type;`

        const results = await this.db.executeSql(query)
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

    createUser = async (data: CreateUserRequest) => {
        const query = `
            INSERT INTO ${this.tableName}
            (name, email, phone, birth_date, is_uploaded, change_type, created_at, updated_at)
            VALUES (?, ?, ?, ?, 0, 'add', ?, ?)
        `

        const timeStamp = new Date().toISOString();
        const resp = await this.db.executeSql(query, [
            data.name, 
            data.email,
            data.phone,
            data.birth_date,
            timeStamp,
            timeStamp
        ]);

        return resp.insertId;
    }

    updateUser = async (data: User) => {
        const now = new Date().toISOString();
        let changeType = 'edit';
        
        const response = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE local_id = ?;`,
            [data.local_id]
        )

        if (response.rows.length === 1) {
            const existingUser = response.rows.item(0) as User;
            if (existingUser.change_type === 'add') {
                changeType = 'add'
            }
        }

        try {
            await this.db.executeSql(
                `UPDATE ${this.tableName}
                SET 
                    name = ?,
                    email = ?,
                    phone = ?,
                    birth_date = ?
                    is_uploaded = 0,
                    change_type = ?,
                    updated_at = ?
                WHERE local_id = ?;`,
                [
                    data.name, data.email, data.phone, data.birth_date, changeType, now, data.local_id
                ]
            )
        } catch(err: any) {
            console.log(err);
        }
    }

    upsertLiveUserIntoLocalDb = async (data: User) => {
        if (!data.id) return;

        const response = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE id = ?;`,
            [data.id]
        )
        if (response.rows.length === 0) {
            // insert live user
            await this.db.executeSql(
                `INSERT INTO ${this.tableName} (
                    id,
                    name,
                    email,
                    phone,
                    birth_date,
                    roles,
                    pin,
                    change_type,
                    is_uploaded,
                    created_at,
                    updated_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                );`,
                [
                    data.id, data.name, data.email, data.phone, data.birth_date, 
                    data.roles, data.pin, 'none', 1, data.created_at, data.updated_at
                ]
            )
        } else {
            // update user
            await this.db.executeSql(
                `UPDATE ${this.tableName}
                SET
                    name = ?,
                    email = ?,
                    phone = ?,
                    birth_date = ?,
                    roles = ?,
                    pin = ?,
                    change_type = 'none',
                    is_uploaded = 1,
                    created_at = ?,
                    updated_at = ?
                WHERE id = ?;`,
                [
                    data.name, data.email, data.phone, data.birth_date, 
                    data.roles, data.pin, data.created_at, data.updated_at, data.id
                ]
            )
        }
    }

    updateLiveUserByLocalId = async (data: User) => {
        // update user
        await this.db.executeSql(
            `UPDATE ${this.tableName}
            SET
                id = ?,
                name = ?,
                email = ?,
                phone = ?,
                birth_date = ?,
                roles = ?,
                pin = ?,
                change_type = 'none',
                is_uploaded = 1,
                created_at = ?,
                updated_at = ?
            WHERE local_id = ?;`,
            [
                data.id, data.name, data.email, data.phone, data.birth_date, 
                data.roles, data.pin, data.created_at, data.updated_at, data.local_id
            ]
        )
    }

    deleteUser = async (id: number) => {
        const response = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE local_id = ?;`,
            [id]
        )

        if (response.rows.length === 1) {
            const existingUser = response.rows.item(0) as User;

            if (existingUser.change_type === 'add') {
                // locally added user: HARD DELETE
                await this.db.executeSql(
                    `DELETE FROM ${this.tableName} WHERE local_id = ?;`,
                    [id]
                )
            } else {
                // Live user
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

    deleteLiveUserFromLocalDb = async (id: number) => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE id = ?;`,
            [id]
        )
    }

    deleteLocalUser = async (id: number) => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE local_id = ?;`,
            [id]
        )
    }

    updateUserUploadStatus = async (id: number) => {
        const query = `UPDATE ${this.tableName} SET is_uploaded = 1, change_type = 'none' WHERE local_id = ${id};`
        await this.db.executeSql(query)
    }

    getLiveUserIds = async () => {
        const query =  `SELECT id FROM ${this.tableName} WHERE id IS NOT NULL;`
        const result = await this.db.executeSql(query);

        const user_ids: number [] = [];
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            user_ids.push(row.id);
        }

        return user_ids;
    }

    searchUsers = async (searchStr: string, offset: number, limit: number) => {
        let users: User[] = [];
        const query =  `
            SELECT * FROM ${this.tableName} 
            WHERE change_type != 'delete' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)
            ORDER BY updated_at DESC
            LIMIT ? OFFSET ?;
        `
        const likeStr = `%${searchStr}%`
        const results = await this.db.executeSql(query, [ likeStr, likeStr, likeStr, limit, offset]);
        for (let index = 0; index < results.rows.length; index++) {
            users.push(results.rows.item(index));
        }
        return users;
    }

    getUsersByEmail = async (email: string) => {
        let users: User[] = [];
        const query =  `
            SELECT * FROM ${this.tableName} 
            WHERE change_type != 'delete' AND email = ?
            ORDER BY updated_at DESC
            LIMIT 10 OFFSET 0;
        `
        const results = await this.db.executeSql(query, [email]);
        for (let index = 0; index < results.rows.length; index++) {
            users.push(results.rows.item(index));
        }
        return users;
    }

    getUserByLiveId = async (id: number) => {
        const query =  `
            SELECT * FROM ${this.tableName}
            WHERE id = ?;
        `
        const results = await this.db.executeSql(query, [id]);
        if (results.rows.length === 1) return results.rows.item(0) as User;
        return null;
    }

    getUserByLocalId = async (id: number) => {
        const query =  `
            SELECT * FROM ${this.tableName}
            WHERE local_id = ?;
        `
        const results = await this.db.executeSql(query, [id]);
        if (results.rows.length === 1) return results.rows.item(0) as User;
        return null;
    }

};