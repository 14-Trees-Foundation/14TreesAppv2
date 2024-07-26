import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreateTreeRequest, Tree } from '../../model/tree';

export class TreesDao {
    private db: SQLiteDatabase;
    private tableName: string = 'trees';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    // Create necessary tables
    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (
                local_id INTEGER PRIMARY KEY AUTOINCREMENT,
                id INTEGER NULL,
                sapling_id TEXT UNIQUE NOT NULL,
                plant_type_id INTEGER NOT NULL,
                plot_id INTEGER,
                image TEXT,
                tags TEXT,
                location TEXT,
                planted_by TEXT,
                mapped_to_user INTEGER,
                mapped_to_group INTEGER,
                mapped_at TEXT,
                sponsored_by_user INTEGER,
                sponsored_by_group INTEGER,
                gifted_by INTEGER,
                gifted_to INTEGER,
                assigned_at TEXT,
                assigned_to INTEGER,
                user_tree_image TEXT,
                user_card_image TEXT,
                description TEXT,
                event_id INTEGER,
                visit_id INTEGER,
                memory_images TEXT,
                tree_status TEXT DEFAULT 'alive' CHECK (tree_status IN ('alive', 'dead', 'lost')),
                is_uploaded INTEGER DEFAULT 0 CHECK (is_uploaded IN (0, 1)),
                change_type TEXT DEFAULT 'none' CHECK (change_type IN ('none', 'add', 'edit', 'delete')),
                created_at TEXT,
                updated_at TEXT
            );`;

            await this.db.executeSql(query);
            console.log('Trees table created successfully!');
        } catch (error) {
            console.log('error creating trees table:', error);
        }
    };

    deleteTable = async () => {
        const query = `drop table ${this.tableName};`;
        await this.db.executeSql(query);
        console.log("Trees table deleted")
    }


    // Data manipulation operations
    getTrees = async (offset: number = 0, limit: number = 10, isUploaded?: boolean, isDeleted: boolean = false, plotId?: number) => {
        const trees: Tree[] = []
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        const query = `SELECT * FROM ${this.tableName}
            WHERE 1=1 ${isDeleted ? '' : ` AND change_type != 'delete'`} 
            ${isUploaded !== undefined ? 'AND ' + whereCondition : ""}
            ${plotId !== undefined ? `AND plot_id = ${plotId}` : ""}
            ORDER BY local_id DESC 
            ${limit < 0 ? '' : `LIMIT ${limit} OFFSET ${offset}`};
        `

        console.log(query);
        const [results] = await this.db.executeSql(query)
        for (let index = 0; index < results.rows.length; index++) {
            trees.push(results.rows.item(index));
        }

        return trees;
    }

    countTreesByChangeTye = async (isUploaded?: boolean): Promise<any> => {
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
        console.log(response)
        return response;
    }

    createTree = async (data: CreateTreeRequest) => {
        const query = `
            INSERT INTO ${this.tableName}
            (sapling_id, plant_type_id, plot_id, location, tree_status, planted_by, assigned_to, assigned_at, visit_id , change_type, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'add', ?, ?)
        `

        const timeStamp = new Date().toISOString();
        await this.db.executeSql(query, [
            data.sapling_id, 
            data.plant_type_id,
            data.plot_id,
            data.location,
            data.tree_status,
            data.planted_by,
            data.assigned_to,
            data.assigned_at,
            data.visit_id,
            timeStamp,
            timeStamp
        ]);
    }

    updateTree = async (data: Tree) => {
        const now = new Date().toISOString();
        let changeType = 'edit';
        
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE local_id = ?;`,
            [data.local_id]
        )

        if (response.rows.length === 1) {
            const existingTree = response.rows.item(0) as Tree;
            if (existingTree.change_type === 'add') {
                changeType = 'add'
            }
        }

        try {
            await this.db.executeSql(
                `UPDATE ${this.tableName}
                SET 
                    sapling_id = ?,
                    plant_type_id = ?,
                    plot_id = ?,
                    location = ?,
                    planted_by = ?,
                    assigned_at = ?,
                    assigned_to = ?,
                    tree_status = ?,
                    visit_id = ?,
                    is_uploaded = 0,
                    change_type = ?,
                    updated_at = ?
                WHERE local_id = ?;`,
                [
                    data.sapling_id, data.plant_type_id, data.plot_id, data.location, data.planted_by,
                    data.assigned_at, data.assigned_to, data.tree_status, data.visit_id, changeType, now, data.local_id
                ]
            )
        } catch(err: any) {
            console.log(err);
        }
    }

    upsertLiveTreeIntoLocalDb = async (data: Tree) => {
        if (!data.id) return;

        const [response] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE id = ?;`,
            [data.id]
        )
        if (response.rows.length === 0) {
            // insert live tree
            await this.db.executeSql(
                `INSERT INTO ${this.tableName} (
                    id,
                    sapling_id,
                    plant_type_id,
                    plot_id,
                    image,
                    tags,
                    location,
                    planted_by,
                    mapped_to_user,
                    mapped_to_group,
                    mapped_at,
                    sponsored_by_user,
                    sponsored_by_group,
                    gifted_by,
                    gifted_to,
                    assigned_at,
                    assigned_to,
                    user_tree_image,
                    user_card_image,
                    description,
                    event_id,
                    visit_id,
                    memory_images,
                    tree_status,
                    is_uploaded,
                    created_at,
                    updated_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?
                );`,
                [
                    data.id, data.sapling_id, data.plant_type_id, data.plot_id, data.image, data.tags, 
                    data.location, data.planted_by, data.mapped_to_user, data.mapped_to_group, data.mapped_at,
                    data.sponsored_by_user, data.sponsored_by_group, data.gifted_by, data.gifted_to, 
                    data.assigned_at, data.assigned_to, data.user_tree_image, data.user_card_image, data.description, data.event_id, 
                    data.visit_id, data.memory_images, data.tree_status, data.created_at, data.updated_at
                ]
            )
        } else {
            // update tree
            await this.db.executeSql(
                `UPDATE ${this.tableName}
                SET
                    sapling_id = ?,
                    plant_type_id = ?,
                    plot_id = ?,
                    image = ?,
                    tags = ?,
                    location = ?,
                    planted_by = ?,
                    mapped_to_user = ?,
                    mapped_to_group = ?,
                    mapped_at = ?,
                    sponsored_by_user = ?,
                    sponsored_by_group = ?,
                    gifted_by = ?,
                    gifted_to = ?,
                    assigned_at = ?,
                    assigned_to = ?,
                    user_tree_image = ?,
                    user_card_image = ?,
                    description = ?,
                    event_id = ?,
                    visit_id = ?,
                    memory_images = ?,
                    tree_status = ?,
                    is_uploaded = 1,
                    change_type = 'none',
                    created_at = ?,
                    updated_at = ?
                WHERE id = ?;`,
                [
                    data.sapling_id, data.plant_type_id, data.plot_id, data.image, data.tags, 
                    data.location, data.planted_by, data.mapped_to_user, data.mapped_to_group, data.mapped_at,
                    data.sponsored_by_user, data.sponsored_by_group, data.gifted_by, data.gifted_to, 
                    data.assigned_at, data.assigned_to, data.user_tree_image, data.user_card_image, data.description, data.event_id, 
                    data.visit_id, data.memory_images, data.tree_status, data.created_at, data.updated_at, data.id
                ]
            )
        }
    }

    bulkInsertTrees = async (trees: Tree[]) => {

        if (trees.length !== 0) {

            let replacement: any[] = []
            let valuesStr = '';
            trees.forEach(data => {
                valuesStr += `(${data.id}, ?, ${data.plant_type_id}, ${data.plot_id}, ?, ?, ?, ${data.mapped_to_user}, ${data.mapped_to_group}, ?, ${data.sponsored_by_user}, ${data.sponsored_by_group}, ${data.gifted_by}, ${data.gifted_to}, ?, ${data.assigned_to}, ${data.visit_id}, ?, ?, ?, 1, ?, ?),`
                replacement = [ ...replacement,
                    data.sapling_id, data.image, data.location, data.planted_by, data.mapped_at, 
                    data.assigned_at, data.user_tree_image, data.user_card_image, data.tree_status, data.created_at, data.updated_at 
                ]
            })
            valuesStr = valuesStr.slice(0, -1);
            
            // insert live tree
            await this.db.executeSql(
                `INSERT OR REPLACE INTO ${this.tableName} (
                    id,
                    sapling_id,
                    plant_type_id,
                    plot_id,
                    image,
                    location,
                    planted_by,
                    mapped_to_user,
                    mapped_to_group,
                    mapped_at,
                    sponsored_by_user,
                    sponsored_by_group,
                    gifted_by,
                    gifted_to,
                    assigned_at,
                    assigned_to,
                    visit_id,
                    user_tree_image,
                    user_card_image,
                    tree_status,
                    is_uploaded,
                    created_at,
                    updated_at
                ) VALUES ${valuesStr};`,
                replacement
            )
        }
    }

    deleteTree = async (id: number) => {
        const [response] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE local_id = ?;`,
            [id]
        )

        if (response.rows.length === 1) {
            const existingTree = response.rows.item(0) as Tree;

            if (existingTree.change_type === 'add') {
                // locally added tree: HARD DELETE
                await this.db.executeSql(
                    `DELETE FROM ${this.tableName} WHERE local_id = ?;`,
                    [id]
                )
            } else {
                // Live tree
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

    deleteLiveTreeFromLocalDb = async (id: number) => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE id = ?;`,
            [id]
        )
    }

    deleteLocalTree = async (id: number) => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE local_id = ?;`,
            [id]
        )
    }

    updateTreeUploadStatus = async (id: number) => {
        const query = `UPDATE ${this.tableName} SET is_uploaded = 1, change_type = 'none' WHERE local_id = ${id};`
        await this.db.executeSql(query)
    }

    getLiveTreeIds = async () => {
        const query =  `SELECT id FROM ${this.tableName} WHERE id IS NOT NULL;`
        const [result] = await this.db.executeSql(query);

        const tree_ids: number [] = [];
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            tree_ids.push(row.id);
        }

        return tree_ids;
    }

    searchTrees = async (searchStr: string, offset: number, limit: number, plotId?: number) => {
        let trees: Tree[] = [];
        const query =  `
            SELECT * FROM ${this.tableName} 
            WHERE change_type != 'delete' AND sapling_id LIKE ?
            ${plotId !== undefined ? `AND plot_id = ${plotId}` : ''}
            ORDER BY updated_at DESC
            LIMIT ? OFFSET ?;
        `

        const [results] = await this.db.executeSql(query, [`%${searchStr}%`, limit, offset]);
        for (let index = 0; index < results.rows.length; index++) {
            trees.push(results.rows.item(index));
        }
        return trees;
    }

};
