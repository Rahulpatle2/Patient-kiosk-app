import { useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { INDIA_STATES, INDIA_CITIES } from '../data/indiaLocations.js'

export default function LocationDropdown({ type, stateCode, value, onSelect, placeholder }) {

  const [open, setOpen] = useState(false)

  // Data load karo — library ki jagah local data
  const items = type === 'state'
    ? INDIA_STATES
    : stateCode && INDIA_CITIES[stateCode]
      ? INDIA_CITIES[stateCode].map(city => ({ name: city }))
      : []

  return (
    <View style={styles.wrapper}>

      {/* Selected Value / Placeholder */}
      <Pressable
        style={styles.selector}
        onPress={() => setOpen(prev => !prev)}
      >
        <Text style={[styles.selectorText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Text style={styles.arrow}>{open ? '▲' : '▼'}</Text>
      </Pressable>

      {/* Dropdown List */}
      {open && (
        <View style={styles.dropdown}>
          <ScrollView
            style={styles.list}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {items.map((item, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.item,
                  pressed && styles.itemPressed,
                  value === item.name && styles.itemSelected,
                ]}
                onPress={() => {
                  onSelect(item)
                  setOpen(false)
                }}
              >
                <Text style={[
                  styles.itemText,
                  value === item.name && styles.itemTextSelected,
                ]}>
                  {item.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 10,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#73737340',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  selectorText: {
    fontSize: 14,
    color: '#001532',
    fontWeight: '500',
  },
  placeholder: {
    color: '#737373',
    fontWeight: '400',
  },
  arrow: {
    fontSize: 12,
    color: '#737373',
  },
  dropdown: {
    position: 'absolute',
    top: 46,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#00A4A440',
    borderRadius: 8,
    zIndex: 999,
    boxShadow: '0px 4px 12px rgba(0,0,0,0.12)',
    maxHeight: 220,
  },
  list: {
    maxHeight: 220,
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#73737326',
  },
  itemPressed: { backgroundColor: '#00A4A410' },
  itemSelected: { backgroundColor: '#00A4A420' },
  itemText: { fontSize: 13, color: '#001532' },
  itemTextSelected: { color: '#00A4A4', fontWeight: '700' },
})