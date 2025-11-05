import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreateTreeImageRequest, TreeImage, TreeImageType } from '../../model/tree_image';

export class TreeImagesDao {
    private db: SQLiteDatabase;
    private tableName: string = 'tree_images';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
                local_id INTEGER PRIMARY KEY AUTOINCREMENT,
                sapling_id TEXT NOT NULL,
                name TEXT NOT NULL,
                data TEXT NOT NULL,
                type TEXT CHECK (type IN ('tree_image', 'user_tree_image', 'user_card_image', 'tree_snapshot')) NOT NULL,
                is_uploaded INTEGER DEFAULT 0 CHECK (is_uploaded IN (0, 1)),
                is_active INTEGER CHECK (is_active IN (0, 1)) NULL,
                user_id INTEGER NULL,
                visit_id INTEGER NULL,
                timestamp TEXT
            );`;

            await this.db.executeSql(query);
            console.log('Tree Images table created successfully!');

            // Add visit_id column if it doesn't exist (for existing tables)
            try {
                await this.db.executeSql(`ALTER TABLE ${this.tableName} ADD COLUMN visit_id INTEGER NULL;`);
                console.log('Added visit_id column to tree_images table.');
            } catch (alterError) {
                // Column already exists, ignore
                console.log('visit_id column already exists in tree_images table.');
            }
        } catch (error) {
            console.log('error creating tree images table:', error);
        }
    };

    deleteTable = async () => {
        const query = `drop table ${this.tableName};`;
        await this.db.executeSql(query);
        console.log("Tree images table deleted")
    }

    upsertTreeImage = async (data: CreateTreeImageRequest) => {
        const now = new Date().toISOString();
        if (data.type != 'tree_snapshot') {
            const result = await this.db.executeSql(
                `SELECT * FROM ${this.tableName}
                WHERE sapling_id = ? AND type = ?;`,
                [data.sapling_id, data.type]
            )
            

            if (result.rows.length === 1) {
                const existingImage = result.rows.item(0) as TreeImage;
                await this.db.executeSql(
                    `UPDATE ${this.tableName}
                    SET
                        name = ?,
                        data = ?,
                        is_uploaded = 0,
                        visit_id = ?,
                        timestamp = ?
                    WHERE local_id = ?;`,
                    [data.name, data.data, data.visit_id, now, existingImage.local_id]
                );

                return;
            }
        }

        const query = `
            INSERT INTO ${this.tableName} (sapling_id, name, data, type, is_uploaded, is_active, user_id, visit_id, timestamp)
            VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)
        `

        await this.db.executeSql( query, [
            data.sapling_id, data.name, data.data, data.type, data.is_active, data.user_id, data.visit_id, now
        ]);
    }

    getTreeImagesForSaplingId = async (saplingId: string, uploaded?: boolean) => {
        let response = {
            'tree_image': null as any,
            'user_tree_image': null as any,
            'user_card_image': null as any,
        };
        const result = await this.db.executeSql(
            `SELECT * FROM ${this.tableName}
            WHERE sapling_id = ? and type != 'tree_snapshot' ${uploaded === undefined ? '' : `AND is_uploaded = ${uploaded ? 1 : 0}`};`,
            [saplingId]
        )
        

        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i) as TreeImage;
            if (row.type === 'tree_image') response.tree_image = row;
            else if (row.type === 'user_card_image') response.user_card_image = row;
            else if (row.type === 'user_tree_image') response.user_tree_image = row;
        }

        return response;
    }

    getTreeImages = async (change_type: TreeImageType, uploaded?: boolean) => {
        let images: TreeImage[] = [];
        const result = await this.db.executeSql(
            `SELECT * FROM ${this.tableName}
            WHERE type = ? ${uploaded === undefined ? '' : `AND is_uploaded = ${uploaded ? 1 : 0}`};`,
            [change_type]
        )
        

        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i) as TreeImage;
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
            `DELETE FROM ${this.tableName} WHERE is_uploaded = 1;`
        )
    }

    countVisitorImages = async (isUploaded?: boolean) => {
        const uploadFilter = isUploaded === undefined ? '' : `AND is_uploaded = ${isUploaded ? 1 : 0}`;
        const query = `
            SELECT type, COUNT(*) as count
            FROM ${this.tableName}
            WHERE type IN ('user_tree_image', 'user_card_image') ${uploadFilter}
            GROUP BY type
        `;

        const result = await this.db.executeSql(query);
        

        const counts: { [key: string]: number } = {
            user_tree_image: 0,
            user_card_image: 0
        };

        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            counts[row.type] = row.count;
        }

        return counts;
    }

    updateImageId = async (localId: number, serverId: number) => {
        await this.db.executeSql(
            `UPDATE ${this.tableName} SET id = ?, is_uploaded = 1 WHERE local_id = ?;`,
            [serverId, localId]
        )
    }

    countVisitorImagesForSapling = async (saplingId: string, isUploaded?: boolean) => {
        const uploadFilter = isUploaded === undefined ? '' : `AND is_uploaded = ${isUploaded ? 1 : 0}`;
        const query = `
            SELECT type, COUNT(*) as count
            FROM ${this.tableName}
            WHERE sapling_id = ? AND type IN ('user_tree_image', 'user_card_image') ${uploadFilter}
            GROUP BY type
        `;

        const result = await this.db.executeSql(query, [saplingId]);
        

        const counts: { [key: string]: number } = {
            user_tree_image: 0,
            user_card_image: 0
        };

        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            counts[row.type] = row.count;
        }

        return counts;
    }

    countVisitorImagesForVisit = async (visitId: number, isUploaded: boolean = false) => {
        const query = `
            SELECT COUNT(*) as total
            FROM ${this.tableName}
            WHERE visit_id = ? AND type IN ('user_tree_image', 'user_card_image')
            AND is_uploaded = ?
        `;

        const result = await this.db.executeSql(query, [visitId, isUploaded ? 1 : 0]);

        return result.rows.length > 0 ? result.rows.item(0).total : 0;
    }

};
