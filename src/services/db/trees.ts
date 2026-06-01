import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { CreateTreeRequest, Tree } from '../../model/tree';

export class TreesDao {
    private db: SQLiteDatabase;
    private tableName: string = 'trees';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    };

    releaseChangesV_3_0_10 = async () => {
        try {

            const query2 = `drop table IF EXISTS ${this.tableName}_new;`;
            await this.db.executeSql(query2);
    
            // Check if 'lost' is already in the CHECK constraint
            const schemaResult = await this.db.executeSql(
                "SELECT sql FROM sqlite_master WHERE type='table' AND name='trees'"
            );
    
            const schema = schemaResult[0].rows.item(0).sql;
    
            // If 'lost' is already in the CHECK constraint, no need to recreate the table
            if (schema.includes("tree_status IN ('healthy', 'dead', 'diseased', 'lost')")) {
                console.log("'lost' is already present in the tree_status constraint.");
                return;
            }
    
            console.log("Updating tree_status constraint to include 'lost'.");

            await this.db.executeSql(`
                CREATE TABLE IF NOT EXISTS trees_new (
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
                    assigned_to_local INTEGER,
                    user_tree_image TEXT,
                    user_card_image TEXT,
                    description TEXT,
                    event_id INTEGER,
                    visit_id INTEGER,
                    memory_images TEXT,
                    tree_status TEXT DEFAULT 'healthy' CHECK (tree_status IN ('healthy', 'dead', 'diseased', 'lost')),
                    is_uploaded INTEGER DEFAULT 0 CHECK (is_uploaded IN (0, 1)),
                    change_type TEXT DEFAULT 'none' CHECK (change_type IN ('none', 'add', 'edit', 'delete')),
                    created_at TEXT,
                    updated_at TEXT
                ); 
            `);

            const limit = 100; // Define batch size
            let offset = 0;
            let rowsCopied;

            do {
                const [result] = await this.db.executeSql(
                    `INSERT INTO trees_new (
                        local_id, id, sapling_id, plant_type_id, plot_id, image, tags, location, 
                        planted_by, mapped_to_user, mapped_to_group, mapped_at, sponsored_by_user, 
                        sponsored_by_group, gifted_by, gifted_to, assigned_at, assigned_to, 
                        assigned_to_local, user_tree_image, user_card_image, description, event_id, 
                        visit_id, memory_images, tree_status, is_uploaded, change_type, created_at, 
                        updated_at
                    )
                    SELECT 
                        local_id, id, sapling_id, plant_type_id, plot_id, image, tags, location, 
                        planted_by, mapped_to_user, mapped_to_group, mapped_at, sponsored_by_user, 
                        sponsored_by_group, gifted_by, gifted_to, assigned_at, assigned_to, 
                        assigned_to_local, user_tree_image, user_card_image, description, event_id, 
                        visit_id, memory_images, tree_status, is_uploaded, change_type, created_at, 
                        updated_at
                    FROM trees
                    LIMIT ? OFFSET ?`,
                    [limit, offset]
                );

                rowsCopied = result.rowsAffected;
                offset += limit;

                console.log(`Copied ${rowsCopied} rows in batch starting from offset ${offset}`);
            } while (rowsCopied > 0); // Continue while rows are being copied

            await this.db.executeSql("DROP TABLE trees");

            await this.db.executeSql("ALTER TABLE trees_new RENAME TO trees");
    
            console.log("Success!");
        } catch (error) {
            console.error("Error updating the table:", error);
        }
    };

    releaseChanges = async () => {
        // adding new column to trees
        try {
            // Query to get the table schema
            const query = `PRAGMA table_info(${this.tableName});`;
            const results = await this.db.executeSql(query);

            // Extract the column names from the results
            const columns = results[0].rows.raw().map(row => row.name);

            if (!columns.includes('assigned_to_local')) {
                await this.db.executeSql(`ALTER TABLE ${this.tableName} ADD COLUMN assigned_to_local TEXT;`);
                console.log(`Column assigned_to_local added to ${this.tableName}.`);
            }
            if (!columns.includes('location_id')) {
                await this.db.executeSql(`ALTER TABLE ${this.tableName} ADD COLUMN location_id INTEGER DEFAULT NULL;`);
                console.log(`Column location_id added to ${this.tableName}.`);
            }
        } catch (error) {
            console.error('Error adding column:', error);
        }

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
                assigned_to_local INTEGER,
                user_tree_image TEXT,
                user_card_image TEXT,
                description TEXT,
                event_id INTEGER,
                visit_id INTEGER,
                memory_images TEXT,
                tree_status TEXT DEFAULT 'healthy' CHECK (tree_status IN ('healthy', 'dead', 'diseased', 'lost')),
                is_uploaded INTEGER DEFAULT 0 CHECK (is_uploaded IN (0, 1)),
                change_type TEXT DEFAULT 'none' CHECK (change_type IN ('none', 'add', 'edit', 'delete')),
                created_at TEXT,
                updated_at TEXT
            );`;

            await this.db.executeSql(query);
            console.log('Trees table created successfully!');
            await this.releaseChanges();
            await this.releaseChangesV_3_0_10();

        } catch (error) {
            console.log('error creating trees table:', error);
        }
    };

    deleteTable = async () => {
        const query = `drop table IF EXISTS ${this.tableName};`;
        await this.db.executeSql(query);
        console.log("Trees table deleted")
    }


    // Data manipulation operations
    getTrees = async (offset: number = 0, limit: number = 10, isUploaded?: boolean, isDeleted: boolean = false, plotId?: number, locationId?: number) => {
        const trees: Tree[] = []
        const whereCondition = `is_uploaded = ${isUploaded ? 1 : 0}`
        let plotFilter = '';
        if (locationId !== undefined && plotId !== undefined && plotId !== locationId) {
            plotFilter = `AND (location_id = ${locationId} OR plot_id = ${plotId})`;
        } else if (locationId !== undefined) {
            plotFilter = `AND location_id = ${locationId}`;
        } else if (plotId !== undefined) {
            plotFilter = `AND plot_id = ${plotId}`;
        }
        const query = `SELECT * FROM ${this.tableName}
            WHERE 1=1 ${isDeleted ? '' : ` AND change_type != 'delete'`}
            ${isUploaded !== undefined ? 'AND ' + whereCondition : ""}
            ${plotFilter}
            ORDER BY local_id DESC
            ${limit < 0 ? '' : `LIMIT ${limit} OFFSET ${offset}`};
        `

        const [results] = await this.db.executeSql(query)
        for (let index = 0; index < results.rows.length; index++) {
            trees.push(results.rows.item(index));
        }

        return trees;
    }

    getTreesBySaplings = async (saplingIds: string[]) => {
        const trees: Tree[] = []
        const placeholders = saplingIds.map(() => '?').join(', ');
        const query = `SELECT * FROM ${this.tableName}
            WHERE change_type != 'delete' AND sapling_id IN (${placeholders})
            ORDER BY local_id DESC;
        `;

        const [results] = await this.db.executeSql(query, saplingIds)
        for (let index = 0; index < results.rows.length; index++) {
            trees.push(results.rows.item(index));
        }

        return trees;
    }

    checkIfSaplingExists = async (saplingId: string) => {
        const query = `
            SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE sapling_id = ?) AS does_exists;
        `
        const [results] = await this.db.executeSql(query, [saplingId])
        return results.rows.length === 0
            ? false
            : results.rows.item(0)?.does_exists === 1
                ? true
                : false
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

        return response;
    }

    createTree = async (data: CreateTreeRequest) => {
        const query = `
            INSERT OR IGNORE INTO ${this.tableName}
            (sapling_id, plant_type_id, plot_id, location, tree_status, planted_by, assigned_to, assigned_to_local, assigned_at, visit_id , change_type, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'add', ?, ?)
        `

        const timeStamp = new Date().toISOString();
        const [resp] = await this.db.executeSql(query, [
            data.sapling_id,
            data.plant_type_id,
            data.plot_id,
            data.location,
            data.tree_status,
            data.planted_by,
            data.assigned_to,
            data.assigned_to_local,
            data.assigned_at,
            data.visit_id,
            timeStamp,
            timeStamp
        ]);

        return resp.rowsAffected > 0;
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
                    assigned_to_local = ?,
                    tree_status = ?,
                    visit_id = ?,
                    is_uploaded = 0,
                    change_type = ?,
                    updated_at = ?
                WHERE local_id = ?;`,
                [
                    data.sapling_id, data.plant_type_id, data.plot_id, data.location, data.planted_by,
                    data.assigned_at, data.assigned_to, data.assigned_to_local, data.tree_status, data.visit_id, changeType, now, data.local_id
                ]
            )
        } catch (err: any) {
            console.log(err);
        }
    }

    updateTreesPlot = async (saplingIds: string[], plotId: number) => {
        const now = new Date().toISOString();
        const saplingIdsStr = saplingIds.map(id => `'${id}'`).join(',');

        await this.db.executeSql(
            `UPDATE ${this.tableName}
            SET 
                plot_id = ?,
                is_uploaded = 0,
                change_type = CASE 
                                WHEN change_type = 'add' THEN 'add' 
                                ELSE 'edit' 
                             END,
                updated_at = ?
            WHERE sapling_id IN (${saplingIdsStr});`,
            [
                plotId, now
            ]
        );
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
                    location_id,
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
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?
                );`,
                [
                    data.id, data.sapling_id, data.plant_type_id, data.plot_id, data.location_id ?? null, data.image, data.tags,
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
                    location_id = ?,
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
                    assigned_to_local = NULL,
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
                    data.sapling_id, data.plant_type_id, data.plot_id, data.location_id ?? null, data.image, data.tags,
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
                valuesStr += `(${data.id}, ?, ${data.plant_type_id}, ${data.plot_id}, ${data.location_id ?? null}, ?, ?, ?, ${data.mapped_to_user}, ${data.mapped_to_group}, ?, ${data.sponsored_by_user}, ${data.sponsored_by_group}, ${data.gifted_by}, ${data.gifted_to}, ?, ${data.assigned_to}, NULL, ${data.visit_id}, ?, ?, ?, 1, ?, ?),`
                replacement = [...replacement,
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
                    location_id,
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
                    assigned_to_local,
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
        const query = `SELECT id FROM ${this.tableName} WHERE id IS NOT NULL;`
        const [result] = await this.db.executeSql(query);

        const tree_ids: number[] = [];
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            tree_ids.push(row.id);
        }

        return tree_ids;
    }

    searchTrees = async (searchStr: string, offset: number, limit: number, plotId?: number, locationId?: number) => {
        let trees: Tree[] = [];
        let plotFilter = '';
        if (locationId !== undefined && plotId !== undefined && plotId !== locationId) {
            plotFilter = `AND (location_id = ${locationId} OR plot_id = ${plotId})`;
        } else if (locationId !== undefined) {
            plotFilter = `AND location_id = ${locationId}`;
        } else if (plotId !== undefined) {
            plotFilter = `AND plot_id = ${plotId}`;
        }
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE change_type != 'delete' AND sapling_id LIKE ?
            ${plotFilter}
            ORDER BY updated_at DESC
            LIMIT ? OFFSET ?;
        `

        const [results] = await this.db.executeSql(query, [`${searchStr}%`, limit, offset]);
        for (let index = 0; index < results.rows.length; index++) {
            trees.push(results.rows.item(index));
        }
        return trees;
    }

    // Dev Only
    deleteDummyTree = async () => {
        // locally added tree: HARD DELETE
        await this.db.executeSql(
            `DELETE FROM ${this.tableName}
            WHERE change_type = 'add' AND is_uploaded = 0 AND planted_by = 'Dummy';`,
        )

        await this.db.executeSql(
            `UPDATE ${this.tableName}
            SET
                is_uploaded = 0,
                change_type = 'delete'
            WHERE planted_by = 'Dummy';`,
        )

    }

    getTreeByLocalId = async (localId: number) => {
        const [result] = await this.db.executeSql(`
            SELECT * from ${this.tableName} WHERE local_id = ?
        `, [localId]);

        if (result.rows.length === 1) return result.rows.item(0) as Tree;
        return null;

    }
};
