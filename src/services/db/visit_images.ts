import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { VisitImage } from '../../model/visit_image';
import { Image } from '../../model/common';

export class VisitImagesDao {
    private db: SQLiteDatabase;
    private tableName: string = 'visit_images';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
                local_id INTEGER PRIMARY KEY AUTOINCREMENT,
                id INTEGER NULL,
                visit_id INTEGER NOT NULL,
                name TEXT NULL,
                data TEXT NULL,
                image_url TEXT NULL,
                is_uploaded INTEGER DEFAULT 0 CHECK (is_uploaded IN (0, 1)),
                created_at TEXT
            );`;

            await this.db.executeSql(query);
            console.log('Visit Images table created successfully!');
        } catch (error) {
            console.log('error creating visit images table:', error);
        }
    };

    deleteTable = async () => {
        const query = `drop table ${this.tableName};`;
        await this.db.executeSql(query);
        console.log("Visit images table deleted")
    }

    insertVisitImages = async (visitId: number, images: Image[]) => {
        const now = new Date().toISOString();
        let placeHolder = ''
        let values: any[] = [];
        images.forEach(image => {
            placeHolder += '(?, ?, ?, 0, ?),'
            values.push(visitId, image.name, image.data, now);
        })
        placeHolder = placeHolder.slice(0, -1);

        const query = `
            INSERT INTO ${this.tableName} (visit_id, name, data, is_uploaded, created_at)
            VALUES ${placeHolder};
        `

        await this.db.executeSql( query, values);
    }

    getVisitImagesByVisitId = async (visitId: number, uploaded?: boolean) => {
        const [result] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName}
            WHERE visit_id = ? ${uploaded === undefined ? '' : `AND is_uploaded = ${uploaded}`};`,
            [visitId]
        )

        let images: VisitImage[] = []
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i) as VisitImage;
            images.push(row);
        }

        return images;
    }

    getVisitImages = async (uploaded?: boolean) => {
        const whereCondition = `is_uploaded = ${uploaded ? 1 : 0}`
        const [result] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName}
            WHERE 1=1 ${uploaded === undefined ? '' : 'AND ' + whereCondition};`
        )

        let images: VisitImage[] = []
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i) as VisitImage;
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

    upsertLiveVisitIntoLocalDb = async (data: VisitImage) => {
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
                    visit_id,
                    image_url,
                    is_uploaded,
                    created_at
                ) VALUES (
                    ?, ?, ?, ?, ?
                );`,
                [
                    data.id, data.visit_id, data.image_url, 1, data.created_at
                ]
            )
        } else {
            // update visit
            await this.db.executeSql(
                `UPDATE ${this.tableName}
                SET
                    visit_id = ?,
                    image_url = ?,
                    is_uploaded = 1,
                    created_at = ?
                WHERE id = ?;`,
                [
                    data.visit_id, data.image_url, data.created_at, data.id
                ]
            )
        }
    }

    deleteLiveVisitFromLocalDb = async (id: number) => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE id = ?;`,
            [id]
        )
    }

    getLiveVisitImageIds = async () => {
        const query =  `SELECT id FROM ${this.tableName} WHERE id IS NOT NULL;`
        const [result] = await this.db.executeSql(query);

        const visit_ids: number [] = [];
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            visit_ids.push(row.id);
        }

        return visit_ids;
    }

    countVisitImages = async (isUploaded?: boolean) => {
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT COUNT(*) as count FROM ${this.tableName}
            WHERE ${isUploaded !== undefined ? whereCondition : "1==1"};`

        const [results] = await this.db.executeSql(query)
        return results.rows.item(0).count;
    }

};
