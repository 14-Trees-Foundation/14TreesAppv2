import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { TextInput, Button, IconButton, Text, Divider, Chip } from 'react-native-paper';
import SearchBar from './Searchbar';


interface SelectMenuInputProps<T> {
    label: string
    value: T | null,
    options: T[],
    recentOptions: T[],
    keyGetter: (option: T) => any
    valueGetter: (option: T) => string
    onSelect: (option: T | null) => void
    onSearch?: (text: string) => void
    variant?: 'flat' | 'outlined'
    disabled?: boolean
    boldSelection?: boolean
}

function SelectMenu<T>({ label, value, options, recentOptions, keyGetter, valueGetter, onSelect, onSearch, variant, disabled, boldSelection }: SelectMenuInputProps<T>) {
    const [filteredData, setFilteredData] = useState(options);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setFilteredData(options);
    }, [options])

    const handleSearch = (query: string) => {
        if (onSearch) {
            onSearch(query);
            return;
        }

        if (query) {
            const newData = options.filter(item => {
                const value = valueGetter(item);
                return value.toLowerCase().includes(query.toLowerCase())
            });

            setFilteredData(newData);
        } else {
            setFilteredData(options);
        }
    };

    const handleClose = () => {
        setVisible(false);
    }

    const handleSelect = (option: T | null) => {
        onSelect(option);
        handleClose();
        setFilteredData(options);
    }

    return (
        <View>
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); disabled || setVisible(true); }}>
                <View pointerEvents='box-only'>
                    <TextInput
                        value={value ? valueGetter(value) : ''}
                        mode={variant ? variant : 'flat'}
                        label={label}
                        disabled={disabled}
                        style={{ fontWeight: (boldSelection && value) ? 'bold' : 'normal' }}
                        numberOfLines={2}
                        multiline={value ? valueGetter(value).length > 50 : false}
                    />
                </View>
            </TouchableWithoutFeedback>

            {value && (
                <IconButton
                    icon="close"
                    size={20}
                    onPress={() => handleSelect(null)}
                    style={styles.iconButton}
                />
            )}

            <Modal
                visible={visible}
                onRequestClose={handleClose}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text variant='titleLarge' style={{ marginBottom: 10 }}>{label}</Text>
                        <SearchBar onChange={handleSearch} />
                        <Divider style={{ marginVertical: 10 }} />
                        <ScrollView keyboardShouldPersistTaps='handled'>
                            {recentOptions.length > 0 && <View>
                                <Text variant='titleSmall'>Recently selected:</Text>
                                <View style={styles.chipContainer}>
                                    {recentOptions.map((item, index) => (
                                        <Chip
                                            key={index}
                                            style={{
                                                margin: 4,
                                                backgroundColor: '#daf7dc',
                                                borderColor: 'black',
                                                borderWidth: 0.5
                                            }}
                                            onPress={() => { handleSelect(item) }}
                                        >
                                            {valueGetter(item)}
                                        </Chip>
                                    ))}
                                </View>
                            </View>}
                            <View>
                                <Text variant='titleSmall'>All Options:</Text>
                                <View style={styles.chipContainer}>
                                    {filteredData.map((item, index) => (
                                        <Chip
                                            key={index}
                                            style={{
                                                margin: 4,
                                                backgroundColor: '#daf7dc',
                                                borderColor: 'black',
                                                borderWidth: 0.5
                                            }}
                                            onPress={() => { handleSelect(item) }}
                                        >
                                            {valueGetter(item)}
                                        </Chip>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                        <View style={{
                            marginTop: 20,
                            flexDirection: 'row',
                            justifyContent: 'space-between', // Adjusts spacing between buttons
                            alignItems: 'center',
                        }}>
                            {value && <Button icon='close' mode="contained" onPress={() => handleSelect(null)} style={{ ...styles.closeButton, backgroundColor: '#FF6666', maxWidth: '60%' }}>
                                {valueGetter(value)}
                            </Button>}
                            <Button mode="contained" onPress={handleClose} style={{ ...styles.closeButton, backgroundColor: '#4CAF50' }}>
                                Close
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '100%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        height: '100%',
    },
    closeButton: {
        marginHorizontal: 5,
        flexGrow: 1,
    },
    container: {
        position: 'relative',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        margin: 10,
        justifyContent: 'flex-start',
    },
    iconButton: {
        position: 'absolute',
        right: 0,
        top: 8
    },
});

export default SelectMenu;
