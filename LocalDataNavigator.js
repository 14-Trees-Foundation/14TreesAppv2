import { createStackNavigator } from "@react-navigation/stack";
import { Strings } from "./Strings";
import LocalDataView from "./LocalDataView";
import { EditLocalTree } from "./EditLocalTree";
import { styleConfigs } from "./Utils";
const Stack = createStackNavigator();
export const LocalDataNavigator = (props)=>
(
    <Stack.Navigator>
    <Stack.Screen
        name={Strings.screenNames.getString('LocalDataView',Strings.english)}
        component={LocalDataView}
        options={{
            headerShown:false,
        }}/>
    <Stack.Screen
        name={Strings.screenNames.getString('EditLocalTree',Strings.english)}
        component={EditLocalTree}
        options={{
            headerShown:false,
        }} />
    </Stack.Navigator>
);