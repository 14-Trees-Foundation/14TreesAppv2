import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Checkbox } from 'react-native-paper';

interface MapRadiusSelectorProps {
    onSelect: (value: number) => void;
    radius: number;
}

const MapRadiusSelector: React.FC<MapRadiusSelectorProps> = ({ radius, onSelect }) => {

    const [value, setValue] = useState(5);
    
    const handleCheckboxPress = () => {
        if (radius < 0) onSelect(value);
        else onSelect(-1);
    }

    const handleRadiusChange = (value: number) => {
        setValue(value);
        onSelect(value);
    }

    return (
        <View>
            <View style={styles.row}>
                <Text style={{ flexGrow: 1, color: 'black' }}>Radius: { radius < 0 ? 'No Limit' : radius.toFixed(1) + 'm'}</Text>
                <Checkbox
                    status={radius < 0 ? 'checked' : 'unchecked'}
                    color='#007bff'
                    uncheckedColor='#ccc'
                    onPress={handleCheckboxPress}
                />
            </View>
            {<View>
                <Slider
                    style={{ height: 40, marginVertical: -10 }}
                    value={radius < 0 ? 5 : radius}
                    minimumValue={5}
                    maximumValue={40}
                    disabled={radius < 0}
                    minimumTrackTintColor="#007bff"
                    maximumTrackTintColor="#000000"
                    onValueChange={handleRadiusChange}
                />
                <View style={styles.sliderLabels}>
                    <Text style={{ flexGrow: 1, textAlign: 'left', color: 'black' }}>5</Text>
                    <Text style={{ flexGrow: 1, textAlign: 'right', color: 'black' }}>40</Text>
                </View>
            </View>}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginTop: 5,
        alignItems: 'center',
    },
    sliderLabels: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        marginBottom: 10,
    },
});

export default MapRadiusSelector;
