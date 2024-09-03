import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { Divider, Icon } from 'react-native-paper';

interface MapRadiusSelectorProps {
    onSelect: (value: number | string) => void;
}

const MapRadiusSelector: React.FC<MapRadiusSelectorProps> = ({ onSelect }) => {
    const options = [5, 10, 15, 20, 25, 30, 50, 'infinity'];
    const [selected, setSelected] = useState<number | string>('infinity');

    const handleSelect = (value: number | string) => {
        setSelected(value);
        onSelect(value);
    };

    const renderOption = (option: number | string, index: number) => {
        const isPastSelected = options.indexOf(selected) >= index;

        return (
            <View key={index} style={styles.optionContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {index !== 0 && (
                        <Divider
                            style={[
                                styles.line,
                                isPastSelected && styles.selectedLine,
                            ]}
                        />
                    )}
                    <TouchableOpacity onPress={() => handleSelect(option)}>
                        <Icon
                            source={isPastSelected ? 'circle-slice-8' : "checkbox-blank-circle-outline"}
                            size={18}
                            color={isPastSelected ? styles.selectedIcon.color : styles.icon.color}
                        />
                    </TouchableOpacity>
                </View>
                <Text style={isPastSelected ? styles.selectedText : styles.text}>
                    {option}
                </Text>
            </View>
        );
    };

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.container}>
                {options.map(renderOption)}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    optionContainer: {
        alignItems: 'flex-end',
    },
    icon: {
        color: '#ccc',
    },
    selectedIcon: {
        color: '#007bff',
    },
    line: {
        height: 2,
        width: 30,
        backgroundColor: '#ccc',
    },
    selectedLine: {
        backgroundColor: '#007bff',
    },
    text: {
        fontSize: 12,
        color: '#333',
        marginHorizontal: 5,
    },
    selectedText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#007bff',
        marginHorizontal: 5,
    },
});

export default MapRadiusSelector;
