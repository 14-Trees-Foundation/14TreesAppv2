import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreateSyncInfoRequest, SyncInfo } from '../../model/sync_info';

export class SyncInfoDao {
    private db: SQLiteDatabase;
    private tableName: string = 'sync_info';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
                local_id INTEGER PRIMARY KEY AUTOINCREMENT,
                id INTEGER NULL,
                trees TEXT NOT NULL,
                tree_images TEXT NULL,
                visit_images TEXT NULL,
                synced_at TEXT UNIQUE,
                upload_time INTEGER NULL,
                fetch_time INTEGER NULL,
                upload_error TEXT NULL,
                fetch_error TEXT NULL,
                is_uploaded INTEGER DEFAULT 0 CHECK (is_uploaded IN (0, 1)),
                change_type TEXT DEFAULT 'none' CHECK (change_type IN ('none', 'add', 'edit', 'delete')),
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );`;

            await this.db.executeSql(query);
            console.log('SyncInfo table created successfully!');
        } catch (error) {
            console.log('error creating sync_info table:', error);
        }
    };

    deleteTable = async () => {
        const query = `drop table ${this.tableName};`;
        await this.db.executeSql(query);
        console.log("SyncInfo table deleted")
    }


    // Data manipulation operations
    getSyncInfo = async (offset: number = 0, limit: number = 10, isUploaded?: boolean, isDeleted: boolean = false) => {
        const syncInfo: SyncInfo[] = []
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT * FROM ${this.tableName}
            WHERE 1=1 ${isDeleted ? '' : ` AND change_type != 'delete'`} ${isUploaded !== undefined ? 'AND ' + whereCondition : ""}
            ORDER BY local_id DESC 
            ${limit < 0 ? '' : `LIMIT ${limit} OFFSET ${offset}`};
        `

        const [results] = await this.db.executeSql(query)
        for (let index = 0; index < results.rows.length; index++) {
            syncInfo.push(results.rows.item(index));
        }

        return syncInfo;
    }

    getSyncInfoBySyncTime = async (syncTime: string): Promise<SyncInfo> => {
        const query = `SELECT * FROM ${this.tableName}
            WHERE synced_at = ?;
        `

        const [results] = await this.db.executeSql(query, [syncTime])
        if (results.rows.length === 0) throw new Error('Sync Information not found!')

        return results.rows.item(0);
    }

    createSyncInfo = async (data: CreateSyncInfoRequest) => {
        const query = `
            INSERT OR REPLACE INTO ${this.tableName}
            (trees, tree_images, visit_images, synced_at, upload_time, fetch_time, upload_error, fetch_error, is_uploaded, change_type, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'add', ?, ?)
        `

        const timeStamp = new Date().toISOString();
        await this.db.executeSql(query, [
            data.trees, 
            data.tree_images,
            data.visit_images,
            data.synced_at,
            data.upload_time,
            data.fetch_time,
            data.upload_error,
            data.fetch_error,
            timeStamp,
            timeStamp
        ]);
    }

    updateSyncInfo = async (data: SyncInfo) => {
        const now = new Date().toISOString();
        let changeType = 'edit';
        
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE local_id = ?;`,
            [data.local_id]
        )

        if (response.rows.length === 1) {
            const existingSyncInfo = response.rows.item(0) as SyncInfo;
            if (existingSyncInfo.change_type === 'add') {
                changeType = 'add'
            }
        }

        try {
            await this.db.executeSql(
                `UPDATE ${this.tableName}
                SET 
                    trees = ?,
                    tree_images = ?,
                    visit_images = ?,
                    synced_at = ?,
                    upload_time = ?,
                    fetch_time = ?,
                    is_uploaded = 0,
                    change_type = ?,
                    updated_at = ?
                WHERE local_id = ?;`,
                [
                    data.trees, data.tree_images, data.visit_images, data.synced_at, data.upload_time, data.fetch_time, changeType, now, data.local_id
                ]
            )
        } catch(err: any) {
            console.log(err);
        }
    }

};