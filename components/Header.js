import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Header({ showTitle = true, onGoHome }) {
    return (
        <View style={styles.header}>
            {showTitle && <Text style={styles.title}>SafeSIP</Text>}
            {/* <TouchableOpacity style={styles.historyButton}>
                <Ionicons name="clipboard-outline" size={24} color="black" />
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.menuButton} onPress={() => {onGoHome && onGoHome()}}>
                <Ionicons name="arrow-back-outline" size={24} color="white" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 60,
    backgroundColor: 'pink',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  menuButton: {
    position: 'absolute',
    left: 15,
  },
})