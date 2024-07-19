import { SQLiteDatabase, enablePromise, openDatabase } from 'react-native-sqlite-storage';
import { TreesDao } from './trees';
import { UsersData } from './users';
import { PlotsDao, PlotsData } from './plots';
import { UsersDao } from './users';
import { TreeImagesDao } from './tree_images';

enablePromise(true);

let dbConnection: SQLiteDatabase;
const getDBConnection = async () => {
    if (!dbConnection) {
        dbConnection = await openDatabase({ name: '14trees.db', location: 'default' });
    }
    return dbConnection;
};

export class LocalDatabase {
    public users: UsersData;
    public plots: PlotsData;
    constructor(dbConnection: SQLiteDatabase) {
        this.users = new UsersData(dbConnection);
        this.plots = new PlotsData(dbConnection);
    
export class DaoClient {
    public trees: TreesDao;
    public users: UsersDao;
    public treeImages: TreeImagesDao;
    public plots: PlotsDao;

    constructor(dbConnection: SQLiteDatabase) {
        this.trees = new TreesDao(dbConnection);
        this.users = new UsersDao(dbConnection);
        this.treeImages = new TreeImagesDao(dbConnection);
        this.plots = new PlotsDao(dbConnection);
    }

    static async authenticate() {
        const connection = await getDBConnection();
        return new DaoClient(connection);
    }

    
}