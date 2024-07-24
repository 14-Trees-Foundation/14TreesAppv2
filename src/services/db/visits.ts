import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreateVisitRequest, Visit } from '../../model/visits';

export class VisitsDao {
    private db: SQLiteDatabase;
    private tableName: string = 'visits';
    private tableVisitUsersName: string = 'visit_users';
    private tableVisitImagesName: string = 'visit_images';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
                local_id INTEGER PRIMARY KEY AUTOINCREMENT,
                id INTEGER NULL,
                visit_name TEXT NOT NULL,
                visit_date TEXT NULL,
                site_id TEXT NULL,
                visit_type TEXT NULL,
                images TEXT NULL,
                is_uploaded INTEGER DEFAULT 0 CHECK (is_uploaded IN (0, 1)),
                change_type TEXT DEFAULT 'none' CHECK (change_type IN ('none', 'add', 'edit', 'delete')),
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );`;

            await this.db.executeSql(query);
            console.log('Visits table created successfully!');

            const visitUsers = `CREATE TABLE IF NOT EXISTS ${this.tableVisitUsersName} (
                visit_id INTEGER NOT NULL, 
                user_id INTEGER NOT NULL,
                PRIMARY KEY (visit_id, user_id)
            );`;
            await this.db.executeSql(visitUsers);
            console.log('Visit Users table created successfully!');
        } catch (error) {
            console.log('error creating visit_users table:', error);
        }
    };

    deleteTable = async () => {
        const query = `drop table if exists ${this.tableName};`;
        await this.db.executeSql(query);
        console.log("Visits table deleted")

        const query2 = `drop table if exists ${this.tableVisitUsersName};`;
        await this.db.executeSql(query2);
        console.log("Visit Users table deleted")
    }


    // Data manipulation operations
    getVisits = async (offset: number = 0, limit: number = 10, isUploaded?: boolean, isDeleted: boolean = false) => {
        const visits: Visit[] = []
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT * FROM ${this.tableName}
            WHERE 1=1 ${isDeleted ? '' : ` AND change_type != 'delete'`} ${isUploaded !== undefined ? 'AND ' + whereCondition : ""}
            ORDER BY local_id DESC 
            ${limit < 0 ? '' : `LIMIT ${limit} OFFSET ${offset}`};
        `

        const [results] = await this.db.executeSql(query)
        for (let index = 0; index < results.rows.length; index++) {
          visits.push(results.rows.item(index));
        }

        return visits;
    }

    countVisitsByChangeTye = async (isUploaded?: boolean): Promise<any> => {
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

    createVisit = async (data: CreateVisitRequest) => {
        const query = `
            INSERT INTO ${this.tableName}
            (visit_name, visit_date, site_id, visit_type, is_uploaded, change_type, created_at, updated_at)
            VALUES (?, ?, ?, ?, 0, 'add', ?, ?)
        `

        const timeStamp = new Date().toISOString();
        await this.db.executeSql(query, [
            data.visit_name, 
            data.visit_date,
            data.site_id,
            data.visit_type,
            timeStamp,
            timeStamp
        ]);
    }

    updateVisit = async (data: Visit) => {
        const now = new Date().toISOString();
        let changeType = 'edit';
        
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE local_id = ?;`,
            [data.local_id]
        )

        if (response.rows.length === 1) {
            const existingVisit = response.rows.item(0) as Visit;
            if (existingVisit.change_type === 'add') {
                changeType = 'add'
            }
        }

        try {
            await this.db.executeSql(
                `UPDATE ${this.tableName}
                SET 
                    visit_name = ?, 
                    visit_date = ?, 
                    site_id = ?,
                    visit_type = ?,
                    is_uploaded = 0,
                    change_type = ?,
                    updated_at = ?
                WHERE local_id = ?;`,
                [
                    data.visit_name, data.visit_date, data.site_id, data.visit_type, changeType, now, data.local_id
                ]
            )
        } catch(err: any) {
            console.log(err);
        }
    }

    upsertLiveVisitIntoLocalDb = async (data: Visit) => {
        if (!data.id) return;

        const [response] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE id = ?;`,
            [data.id]
        )
        if (response.rows.length === 0) {
            // insert live visit
            await this.db.executeSql(
                `INSERT INTO ${this.tableName} (
                    id,
                    visit_name,
                    visit_date,
                    site_id,
                    visit_type,
                    change_type,
                    is_uploaded,
                    created_at,
                    updated_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?
                );`,
                [
                    data.id, data.visit_name, data.visit_date, data.site_id, data.visit_type, 'none', 1, data.created_at, data.updated_at
                ]
            )
        } else {
            // update visit
            await this.db.executeSql(
                `UPDATE ${this.tableName}
                SET
                    visit_name = ?,
                    visit_date = ?,
                    site_id = ?,
                    visit_type = ?,
                    change_type = 'none',
                    is_uploaded = 1,
                    created_at = ?,
                    updated_at = ?
                WHERE id = ?;`,
                [
                    data.visit_name, data.visit_date, data.site_id, data.visit_type, data.created_at, data.updated_at, data.id
                ]
            )
        }
    }

    deleteVisit=  async (id: number) => {
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE local_id = ?;`,
            [id]
        )

        if (response.rows.length === 1) {
            const existingVisit = response.rows.item(0) as Visit;

            if (existingVisit.change_type === 'add') {
                // locally added visit: HARD DELETE
                await this.db.executeSql(
                    `DELETE FROM ${this.tableName} WHERE local_id = ?;`,
                    [id]
                )
            } else {
                // Live visit
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

    deleteLiveVisitFromLocalDb = async (id: number) => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE id = ?;`,
            [id]
        )
    }

    deleteLocalVisit = async (id: number) => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE local_id = ?;`,
            [id]
        )
    }

    updateVisitUploadStatus = async (id: number) => {
        const query = `UPDATE ${this.tableName} SET is_uploaded = 1, change_type = 'none' WHERE local_id = ${id};`
        await this.db.executeSql(query)
    }

    getLiveVisitIds = async () => {
        const query =  `SELECT id FROM ${this.tableName} WHERE id IS NOT NULL;`
        const [result] = await this.db.executeSql(query);

        const visit_ids: number [] = [];
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            visit_ids.push(row.id);
        }

        return visit_ids;
    }

    searchVisits = async (searchStr: string, offset: number, limit: number) => {
        let visits: Visit[] = [];
        const query =  `
            SELECT * FROM ${this.tableName} 
            WHERE change_type != 'delete' AND visit_name LIKE ?
            ORDER BY updated_at DESC
            LIMIT ? OFFSET ?;
        `
        const likeStr = `%${searchStr}%`
        const [results] = await this.db.executeSql(query, [ likeStr, limit, offset]);
        for (let index = 0; index < results.rows.length; index++) {
          visits.push(results.rows.item(index));
        }
        return visits;
    }

    getVisitByLiveId = async (id: number) => {
        const query =  `
            SELECT * FROM ${this.tableName} 
            WHERE id = ?;
        `
        const [results] = await this.db.executeSql(query, [id]);
        if (results.rows.length === 1) return results.rows.item(0) as Visit;
        return null;
    }


    /*
        Visit Users relationship
    */

    addUsersToVisit = async (visitId: number, userIds: number[]) => {
        let placeHolder = '';
        let values: number[] = [];
        userIds.forEach((userId) => {
            placeHolder += `(?, ?),`
            values.push(visitId, userId);
        })
        placeHolder = placeHolder.slice(0, -1);

        const query = `
        INSERT OR REPLACE INTO ${this.tableVisitUsersName} (visit_id, user_id)
        VALUES ${placeHolder};
        `;

        await this.db.executeSql(query, values);
    }

    getVisitUsers = async (visitId: number) => {

        const query = `SELECT user_id FROM ${this.tableVisitUsersName} WHERE visit_id = ?`;
        const [result] = await this.db.executeSql(query, [visitId]);

        let userIds: number[] = [];
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            userIds.push(row.user_id);
        }

        return userIds;
    }

};