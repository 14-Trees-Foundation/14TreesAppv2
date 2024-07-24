import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import moment from "moment";
import { useEffect, useState } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { View } from "react-native"
import { TextInput } from "react-native-paper";

interface DatePickerInputProps {
    label: string,
    value: Date | null,
    onChange: (date: Date) => void
}

export const DatePicker: React.FC<DatePickerInputProps> = ({ label, value, onChange }) => {

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [date, setDate] = useState(new Date());
    const [datePicketVisible, setDatePickerVisible] = useState(false);

    useEffect(() => {
        if (value) {
            setDate(value);
            setSelectedDate(value);
        }
    }, [value])

    const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setDatePickerVisible(false);
        if (selectedDate) {
            setDate(selectedDate);
            setSelectedDate(selectedDate);
            onChange(selectedDate)
        }
    };

    return (
        <View>
            <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss(); setDatePickerVisible(true);}}>
                <View pointerEvents='box-only'>
                <TextInput
                    value={selectedDate ? moment(selectedDate).format('DD/MM/YYYY') : 'dd/mm/yyyy' }
                    mode='flat'
                    label={label}
                />
                </View>
            </TouchableWithoutFeedback>
            {datePicketVisible && <DateTimePicker
                value={date}
                mode='date'
                onChange={handleChange}
            />}
        </View>
    )
}