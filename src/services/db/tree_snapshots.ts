import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { Image } from '../../model/common';
import { CreateTreeSnapshotRequest, TreeSnapshot } from '../../model/tree_snapshot';

export class TreeSnapshotsDao {
    private db: SQLiteDatabase;
    private tableName: string = 'tree_snapshots';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
                local_id INTEGER PRIMARY KEY AUTOINCREMENT,
                id INTEGER NULL,
                sapling_id TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                name TEXT NULL,
                data TEXT NULL,
                image TEXT NULL,
                image_date TEXT,
                tree_status TEXT,
                is_uploaded INTEGER DEFAULT 0 CHECK (is_uploaded IN (0, 1)),
                created_at TEXT
            );`;

            await this.db.executeSql(query);
            console.log('Tree snapshots table created successfully!');
        } catch (error) {
            console.log('error creating tree snapshots table:', error);
        }
    };

    deleteTable = async () => {
        const query = `drop table ${this.tableName};`;
        await this.db.executeSql(query);
        console.log("Tree snapshots table deleted")
    }

    insertTreeSnapshots = async (saplingId: string, userId: number, images: CreateTreeSnapshotRequest[]) => {
        const now = new Date().toISOString();
        let placeHolder = ''
        let values: any[] = [];
        images.forEach(image => {
            placeHolder += '(?, ?, ?, ?, ?, ?, 0, ?),'
            values.push(saplingId, userId, image.name, image.data, image.image_date, image.tree_status, now);
        })
        placeHolder = placeHolder.slice(0, -1);

        const query = `
            INSERT INTO ${this.tableName} (sapling_id, user_id, name, data, image_date, tree_status, is_uploaded, created_at)
            VALUES ${placeHolder};
        `

        await this.db.executeSql( query, values);
    }

    getTreeSnapshotsBySaplingId = async (saplingId: string, uploaded?: boolean) => {
        const [result] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName}
            WHERE sapling_id = ? ${uploaded === undefined ? '' : `AND is_uploaded = ${uploaded}`};`,
            [saplingId]
        )

        let images: TreeSnapshot[] = []
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i) as TreeSnapshot;
            images.push(row);
        }

        return images;
    }

    getTreeSnapshots = async (uploaded?: boolean) => {
        const whereCondition = `is_uploaded = ${uploaded ? 1 : 0}`
        const [result] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName}
            WHERE 1=1 ${uploaded === undefined ? '' : 'AND ' + whereCondition};`
        )

        let images: TreeSnapshot[] = []
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i) as TreeSnapshot;
            images.push(row);
        }

        return images;
    }

    markImageUploaded = async (id: number) => {
        await this.db.executeSql(
            `UPDATE ${this.tableName} SET is_uploaded = 1 WHERE local_id = ?;`,
            [id]
        )
    }

    deleteUploadedImages = async () => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE id IS NULL AND is_uploaded = 1;`
        )
    }

    upsertLiveTreeSnapshotIntoLocalDb = async (data: TreeSnapshot) => {
        if (!data.id) return;

        const [response] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE id = ?;`,
            [data.id]
        )
        if (response.rows.length === 0) {
            // insert live tree snapshot
            await this.db.executeSql(
                `INSERT INTO ${this.tableName} (
                    id,
                    sapling_id,
                    user_id,
                    image,
                    image_date,
                    tree_status,
                    is_uploaded,
                    created_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?
                );`,
                [
                    data.id, data.sapling_id, data.user_id, data.image, data.image_date, data.tree_status, 1, data.created_at
                ]
            )
        } else {
            // update tree snapshot
            await this.db.executeSql(
                `UPDATE ${this.tableName}
                SET
                    sapling_id = ?,
                    user_id = ?,
                    image = ?,
                    image_date = ?,
                    tree_status = ?,
                    is_uploaded = 1,
                    created_at = ?
                WHERE id = ?;`,
                [
                    data.sapling_id, data.user_id, data.image, data.image_date, data.tree_status, data.created_at, data.id
                ]
            )
        }
    }

    deleteLiveTreeSnapshotFromLocalDb = async (id: number) => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE id = ?;`,
            [id]
        )
    }

    getLiveTreeSnapshotIds = async () => {
        const query =  `SELECT id FROM ${this.tableName} WHERE id IS NOT NULL;`
        const [result] = await this.db.executeSql(query);

        const visit_ids: number [] = [];
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            visit_ids.push(row.id);
        }

        return visit_ids;
    }

    countTreeSnapshotImages = async (isUploaded?: boolean) => {
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT COUNT(*) as count FROM ${this.tableName}
            WHERE ${isUploaded !== undefined ? whereCondition : "1==1"};`

        const [results] = await this.db.executeSql(query)
        return results.rows.item(0).count;
    }

};
