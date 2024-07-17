import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreateSiteRequest, Sites } from '../../model/sites';

const sitesTableName = 'sites'

export class SitesDao {
    private db: SQLiteDatabase;
    private tableName: string = 'sites';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };


    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${this.tableName}(
                local_id INTEGER PRIMARY KEY AUTOINCREMENT,
                id INTEGER NULL,
                name_english TEXT NOT NULL,
                name_marathi TEXT NOT NULL,
                
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
        const query = `drop table ${this.tableName};`;
        await this.db.executeSql(query);
        console.log("Sites table deleted")
    }

    // Data manipulation operations
    getSites = async (offset: number = 0, limit: number = 10, isUploaded?: boolean ,isDeleted: boolean = false) => {
        const site: Sites[] = []
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT * FROM ${this.tableName}
            WHERE 1=1 ${isDeleted ? '' : ` AND change_type != 'delete'`} ${isUploaded !== undefined ? 'AND ' + whereCondition : ""}
            ORDER BY local_id DESC 
            ${limit < 0 ? '' : `LIMIT ${limit} OFFSET ${offset}`};
        `

        const [results] = await this.db.executeSql(query)
        for (let index = 0; index < results.rows.length; index++) {
          site.push(results.rows.item(index));
        }

        return site;
    }


    // countSitesByChangeTye = async (isUploaded?: boolean): Promise<any> => {
    //     const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
    //     const query = `SELECT change_type, COUNT(*) as count FROM ${this.tableName}
    //         WHERE ${isUploaded !== undefined ? whereCondition : "1==1"} GROUP BY change_type;`

    //     const [results] = await this.db.executeSql(query)
    //     let response: any = {}
    //     for (let i = 0; i < results.rows.length; i++) {
    //         const row = results.rows.item(i);
    //         response = {
    //             ...response,
    //             [row.change_type]: row.count,
    //         }
    //     }

    //     return response;
    // }


    createSite = async (data: CreateSiteRequest) => {
        const query = `
            INSERT INTO ${this.tableName}
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
            `SELECT * FROM ${this.tableName} WHERE local_id = ?;`,
            [data.local_id]
        )

        if (response.rows.length === 1) {
            const existingSite = response.rows.item(0) as Sites;
            if (existingSite.change_type === 'add') {
                changeType = 'add'
            }
        }

        try {
            await this.db.executeSql(
                `UPDATE ${this.tableName}
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
                    is_uploaded = 0,
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
                  changeType, 
                  now, 
                  data.local_id,
                  data.consent_document_link,]
            )
        } catch(err: any) {
            console.log(err);
        }
    }

 

    deleteSite = async (id: number) => {
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE local_id = ?;`,
            [id]
        )

        // locally added Site: HARD DELETE
        if (response.rows.length === 1) {
            const existingSite = response.rows.item(0) as Sites;
            if (existingSite.change_type === 'add') {
                await this.db.executeSql(
                    `DELETE FROM ${this.tableName} WHERE local_id = ?;`,
                    [id]
                )
            } else {
                // Live Site
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


    updateSiteUploadStatus = async (id: number) => {
        const query = `UPDATE ${this.tableName} SET is_uploaded = 1, change_type = 'none' WHERE local_id = ${id};`
        await this.db.executeSql(query)
    }

    getSiteByLiveId = async (id: number) => {
        const query =  `
            SELECT * FROM ${this.tableName} 
            WHERE id = ?;
        `
        const [results] = await this.db.executeSql(query, [id]);
        if (results.rows.length === 1) return results.rows.item(0) as Sites;
        return null;
    }

 
}

