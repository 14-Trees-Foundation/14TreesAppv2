import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { LocationPlot } from '../../model/plot';

export class LocationPlotsDao {
    private db: SQLiteDatabase;
    private tableName: string = 'location_plots';

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    createTable = async () => {
        try {
            const query = `CREATE TABLE IF NOT EXISTS ${this.tableName}(
                location_id INTEGER PRIMARY KEY,
                location_name TEXT NOT NULL,
                display_name TEXT,
                location_type TEXT,
                parent_location_id INTEGER,
                location_path TEXT,
                total_trees_count INTEGER DEFAULT 0,
                total_area_including_children REAL DEFAULT 0,
                document_count INTEGER DEFAULT 0,
                alert_count INTEGER DEFAULT 0,
                old_plot_id INTEGER DEFAULT NULL
            );`;
            await this.db.executeSql(query);
            await this.releaseChanges();
            console.log('location_plots table created successfully!');
        } catch (error) {
            console.log('error creating location_plots table:', error);
        }
    };

    releaseChanges = async () => {
        try {
            const [result] = await this.db.executeSql(`PRAGMA table_info(${this.tableName});`);
            const columns = Array.from({ length: result.rows.length }, (_, i) => result.rows.item(i).name);
            if (!columns.includes('old_plot_id')) {
                await this.db.executeSql(`ALTER TABLE ${this.tableName} ADD COLUMN old_plot_id INTEGER DEFAULT NULL;`);
                console.log('old_plot_id column added to location_plots');
            }
        } catch (error) {
            console.error('Error in location_plots releaseChanges:', error);
        }
    };

    upsertLocationPlot = async (data: LocationPlot, oldPlotId?: number | null) => {
        const [response] = await this.db.executeSql(
            `SELECT location_id FROM ${this.tableName} WHERE location_id = ?;`,
            [data.id]
        );
        if (response.rows.length === 0) {
            await this.db.executeSql(
                `INSERT INTO ${this.tableName} (
                    location_id, location_name, display_name, location_type, parent_location_id,
                    location_path, total_trees_count, total_area_including_children,
                    document_count, alert_count, old_plot_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [
                    data.id, data.location_name, data.display_name, data.location_type,
                    data.parent_location_id, data.location_path, data.total_trees_count,
                    data.total_area_including_children, data.document_count, data.alert_count,
                    oldPlotId ?? null,
                ]
            );
        } else {
            await this.db.executeSql(
                `UPDATE ${this.tableName} SET
                    location_name = ?, display_name = ?, location_type = ?, parent_location_id = ?,
                    location_path = ?, total_trees_count = ?, total_area_including_children = ?,
                    document_count = ?, alert_count = ?, old_plot_id = ?
                WHERE location_id = ?;`,
                [
                    data.location_name, data.display_name, data.location_type, data.parent_location_id,
                    data.location_path, data.total_trees_count, data.total_area_including_children,
                    data.document_count, data.alert_count, oldPlotId ?? null, data.id,
                ]
            );
        }
    };

    clearByParent = async (parentLocationId: number) => {
        await this.db.executeSql(
            `DELETE FROM ${this.tableName} WHERE parent_location_id = ?;`,
            [parentLocationId]
        );
    };

    getLocationPlots = async (parentLocationId?: number): Promise<LocationPlot[]> => {
        const plots: LocationPlot[] = [];
        const where = parentLocationId !== undefined ? `WHERE parent_location_id = ${parentLocationId}` : '';
        const query = `SELECT * FROM ${this.tableName} ${where} ORDER BY location_name ASC;`;
        const [results] = await this.db.executeSql(query);
        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            plots.push({
                id: row.location_id,
                location_name: row.location_name,
                display_name: row.display_name,
                location_type: row.location_type,
                parent_location_id: row.parent_location_id,
                location_path: row.location_path,
                total_trees_count: row.total_trees_count,
                total_area_including_children: row.total_area_including_children,
                document_count: row.document_count,
                alert_count: row.alert_count,
                old_plot_id: row.old_plot_id ?? null,
            });
        }
        return plots;
    };

    getByOldPlotId = async (oldPlotId: number): Promise<LocationPlot | null> => {
        const [results] = await this.db.executeSql(
            `SELECT * FROM ${this.tableName} WHERE old_plot_id = ? LIMIT 1;`,
            [oldPlotId]
        );
        if (results.rows.length === 0) return null;
        const row = results.rows.item(0);
        return {
            id: row.location_id,
            location_name: row.location_name,
            display_name: row.display_name,
            location_type: row.location_type,
            parent_location_id: row.parent_location_id,
            location_path: row.location_path,
            total_trees_count: row.total_trees_count,
            total_area_including_children: row.total_area_including_children,
            document_count: row.document_count,
            alert_count: row.alert_count,
            old_plot_id: row.old_plot_id ?? null,
        };
    };

    searchLocationPlots = async (query: string, parentLocationId?: number): Promise<LocationPlot[]> => {
        const plots: LocationPlot[] = [];
        const likeStr = `%${query}%`;
        const siteFilter = parentLocationId !== undefined ? `AND parent_location_id = ${parentLocationId}` : '';
        const sql = `SELECT * FROM ${this.tableName}
            WHERE (location_name LIKE ? OR display_name LIKE ?) ${siteFilter}
            ORDER BY location_name ASC;`;
        const [results] = await this.db.executeSql(sql, [likeStr, likeStr]);
        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            plots.push({
                id: row.location_id,
                location_name: row.location_name,
                display_name: row.display_name,
                location_type: row.location_type,
                parent_location_id: row.parent_location_id,
                location_path: row.location_path,
                total_trees_count: row.total_trees_count,
                total_area_including_children: row.total_area_including_children,
                document_count: row.document_count,
                alert_count: row.alert_count,
                old_plot_id: row.old_plot_id ?? null,
            });
        }
        return plots;
    };
}
