import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreateSiteRequest, Sites } from '../../model/sites';

const sitesTableName = 'sites'

export class SitessData {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${sitesTableName}(
                local_id INTEGER PRIMARY KEY AUTOINCREMENT,
                id INTEGER NULL,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                birth_date TEXT NULL,
                pin TEXT NULL,
                roles TEXT NULL,
                is_uploaded INTEGER DEFAULT 0 CHECK (is_uploaded IN (0, 1)),
                change_type TEXT DEFAULT 'none' CHECK (change_type IN ('none', 'add', 'edit', 'delete')),
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );`;

            await this.db.executeSql(query);
            console.log('Sites table created successfully!');
        } catch (error) {
            console.log('error creating sites table:', error);
        }
    };

    deleteTable = async () => {
        const query = `drop table ${sitesTableName};`;
        await this.db.executeSql(query);
        console.log("Sites table deleted")
    }

    getSites = async (offset: number = 0, limit: number = 10, isUploaded?: boolean) => {
        const site: Sites[] = []
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT * FROM ${sitesTableName}
            WHERE change_type != 'delete' ${isUploaded !== undefined ? 'AND' + whereCondition : ""} ORDER BY local_id DESC LIMIT ${limit} OFFSET ${offset};`

        const [results] = await this.db.executeSql(query)
        for (let index = 0; index < results.rows.length; index++) {
          site.push(results.rows.item(index));
        }

        return site;
    }



    createSite = async (data: CreateSiteRequest) => {
        const query = `
            INSERT INTO ${sitesTableName}
            ( name_marathi,
              name_english,
              owner,
              land_type,
              land_strata,
              district,
              taluka,
              village,
              area_acres,
              length_km,
              consent_letter,
              grove_type,
              consent_document_link)
            VALUES (?, ?, ?, ?, ?, ?, ?, ? ,?, ?, ? ,?)
        `

        const timeStamp = new Date().toISOString();
        const [results] = await this.db.executeSql(query, [
            data.name_marathi, 
            data.name_english,
            data.owner,
            data.land_type,
            data.land_strata,
            data.district,
            data.taluka,
            data.village,
            data.area_acres,
            data.length_km,
            data.consent_letter,
            data.grove_type,
            data.consent_document_link,

            timeStamp,
            timeStamp
        ]);
        console.log(JSON.stringify(results))
    }

    updateSite = async (data: Sites) => {
        const now = new Date().toISOString();
        let changeType = 'edit';
        
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${sitesTableName} WHERE id = ?;`
            [data.id]
        )

        if (response.rows.length === 1) {
            const existingSite = response.rows.item(0) as Sites;
            if (existingSite.change_type === 'add') {
                changeType = 'add'
            }
        }

        try {
            await this.db.executeSql(
                `UPDATE ${sitesTableName}
                SET
                    name_english = ?,
                    name_marathi = ?,
                    owner = ?,
                    land_type=?,

                    land_strata =?,
                    district=?,
                    taluka=?,
                    village=?,
                    area_acres=?,
                    length_km=?,
                    consent_letter=?,
                    grove_type=?,
                    consent_document_link=?,
                    is_uploaded = 0,
                    updated_at = ?
                WHERE id = ?;`,
                [data.name_marathi, 
                  data.name_english,
                  data.owner,
                  data.land_type,
                  data.land_strata,
                  data.district,
                  data.taluka,
                  data.village,
                  data.area_acres,
                  data.length_km,
                  data.consent_letter,
                  data.grove_type,
                  data.consent_document_link,]
            )
        } catch(err: any) {
            console.log(err);
        }
    }

 

    deleteSite = async (id: number) => {
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${sitesTableName} WHERE id = ?;`
            [id]
        )

        // locally added user: HARD DELETE
        if (response.rows.length === 1) {
            const existingSite = response.rows.item(0) as Site;
            if (existingSite.change_type === 'add') {
                await this.db.executeSql(
                    `DELETE FROM ${sitesTableName} WHERE id = ?;`
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

 
}

