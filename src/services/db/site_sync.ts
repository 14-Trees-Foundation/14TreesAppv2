import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { SiteSync } from '../../model/site_sync';

export class SiteSyncsDao {
    private db: SQLiteDatabase;
    private tableName: string = 'site_syncs';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
                local_id INTEGER PRIMARY KEY AUTOINCREMENT,
                id INTEGER NULL,
                site_id INTEGER NOT NULL,
                entity_sync_key INTEGER NOT NULL,
                created_at TEXT NOT NULL
            );`;

            await this.db.executeSql(query);
            console.log('Site sync table created successfully!');
        } catch (error) {
            console.log('error creating Site sync table:', error);
        }
    };

    deleteTable = async () => {
        const query = `drop table ${this.tableName};`;
        await this.db.executeSql(query);
        console.log("Site syncs table deleted")
    }


    // Data manipulation operations
    getSiteLastSyncTime = async (siteId: number, syncKey: string): Promise<SiteSync | null> => {
        const query = `SELECT * FROM ${this.tableName}
            WHERE site_id = ? AND entity_sync_key = ?
            ORDER BY created_at DESC
            LIMIT 1 OFFSET 0;
        `

        const [results] = await this.db.executeSql(query, [siteId, syncKey])
        if (results.rows.length === 1) {
            return results.rows.item(0);
        }
        return null;
    }

    createLastSyncTime = async (siteId: number, syncKey: string, timestamp: string) => {
        const query = `
            INSERT INTO ${this.tableName}
            (site_id, entity_sync_key, created_at)
            VALUES (?, ?, ?)
        `

        await this.db.executeSql(query, [
            siteId,
            syncKey,
            timestamp
        ]);
    }

};