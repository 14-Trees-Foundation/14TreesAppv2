import { SQLiteDatabase, enablePromise, openDatabase } from 'react-native-sqlite-storage';
import { TreesDao } from './trees';
import { UsersDao } from './users';
import { PlotsDao } from './plots';
import { TreeImagesDao } from './tree_images';
import { SitesDao } from './sites';
import { VisitsDao } from './visits';
import { VisitImagesDao } from './visit_images';
import { TreeSnapshotsDao } from './tree_snapshots';
import { SyncInfoDao } from './sync_info';
import { SiteSyncsDao } from './site_sync';
import { PlantTypesDao } from './plant_type';

enablePromise(true);

let dbConnection: SQLiteDatabase;
const getDBConnection = async () => {
    if (!dbConnection) {
        dbConnection = await openDatabase({ name: '14trees.db', location: 'default' });
    }
    return dbConnection;
};

export class DaoClient {
    public trees: TreesDao;
    public users: UsersDao;
    public treeImages: TreeImagesDao;
    public plots: PlotsDao;
    public sites: SitesDao;
    public visits: VisitsDao;
    public visitImages: VisitImagesDao;
    public treeSnapshots: TreeSnapshotsDao;
    public syncInfo: SyncInfoDao;
    public siteSync: SiteSyncsDao;
    public plantTypes: PlantTypesDao;

    constructor(dbConnection: SQLiteDatabase) {
        this.trees = new TreesDao(dbConnection);
        this.users = new UsersDao(dbConnection);
        this.treeImages = new TreeImagesDao(dbConnection);
        this.plots = new PlotsDao(dbConnection);
        this.sites = new SitesDao(dbConnection);
        this.visits = new VisitsDao(dbConnection);
        this.visitImages = new VisitImagesDao(dbConnection);
        this.treeSnapshots = new TreeSnapshotsDao(dbConnection);
        this.syncInfo = new SyncInfoDao(dbConnection);
        this.siteSync = new SiteSyncsDao(dbConnection);
        this.plantTypes = new PlantTypesDao(dbConnection);
    }

    static async authenticate() {
        const connection = await getDBConnection();
        return new DaoClient(connection);
    }
}