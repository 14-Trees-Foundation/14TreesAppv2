import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreateVisitImageRequest, VisitImage } from '../../model/visit_image';
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
                visit_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                data TEXT NOT NULL,
                is_uploaded INTEGER DEFAULT 0 CHECK (is_uploaded IN (0, 1)),
                timestamp TEXT
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
            INSERT INTO ${this.tableName} (visit_id, name, data, is_uploaded, timestamp)
            VALUES ${placeHolder};
        `

        await this.db.executeSql( query, values);
    }

    getVisitImages = async (visitId: number, uploaded?: boolean) => {
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

};
