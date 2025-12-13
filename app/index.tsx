import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ReceiptItem {
  product: string;
  quantity: string;
  amount: string;
}

export default function App() {
  const [title, setTitle] = useState<string>('');
  const [items, setItems] = useState<ReceiptItem[]>([{ product: '', quantity: '', amount: '' }]);
  const [businessName, setBusinessName] = useState<string>('');

  const addItem = (): void => {
    setItems([...items, { product: '', quantity: '', amount: '' }]);
  };

  const removeItem = (index: number): void => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: string): void => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = (): number => {
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 1;
      const amount = parseFloat(item.amount) || 0;
      return sum + (quantity * amount);
    }, 0);
  };

  const generateHTML = (): string => {
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const receiptNumber = `#${Math.floor(Math.random() * 100000)}`;
    const total = calculateTotal();
    
    const itemsHTML = items
      .filter(item => item.product.trim() !== '')
      .map(
        (item, index) => {
          const quantity = parseFloat(item.quantity) || 1;
          const amount = parseFloat(item.amount) || 0;
          const lineTotal = quantity * amount;
          return `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${index + 1}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0;">${item.product}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${quantity}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">${amount.toFixed(2)}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: 600;">${lineTotal.toFixed(2)}</td>
        </tr>
      `;
        }
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              padding: 40px;
              background: white;
              color: #333;
              line-height: 1.6;
            }
            
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              border: 2px solid #8B5CF6;
              border-radius: 10px;
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
              color: white;
              padding: 30px 40px;
              position: relative;
            }
            
            .header::after {
              content: '';
              position: absolute;
              bottom: -20px;
              left: 0;
              right: 0;
              height: 20px;
              background: white;
              clip-path: polygon(0 20px, 100% 0, 100% 20px, 0 20px);
            }
            
            .business-name {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 5px;
              letter-spacing: 0.5px;
            }
            
            .receipt-title {
              font-size: 18px;
              opacity: 0.95;
              font-weight: 300;
            }
            
            .invoice-details {
              display: flex;
              justify-content: space-between;
              padding: 30px 40px 20px;
              background: #f8f9fa;
              border-bottom: 2px solid #e0e0e0;
            }
            
            .detail-block {
              flex: 1;
            }
            
            .detail-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 5px;
              font-weight: 600;
            }
            
            .detail-value {
              font-size: 16px;
              color: #333;
              font-weight: 600;
            }
            
            .content {
              padding: 30px 40px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            
            thead {
              background: #f8f9fa;
            }
            
            th {
              padding: 12px 8px;
              text-align: left;
              font-size: 12px;
              font-weight: 700;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #8B5CF6;
            }
            
            th:first-child {
              text-align: center;
            }
            
            th:nth-child(3),
            th:nth-child(4),
            th:nth-child(5) {
              text-align: right;
            }
            
            tbody tr:hover {
              background: #f8f9fa;
            }
            
            .subtotal-section {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px solid #e0e0e0;
            }
            
            .subtotal-row {
              display: flex;
              justify-content: flex-end;
              padding: 8px 0;
              font-size: 15px;
            }
            
            .subtotal-label {
              width: 150px;
              text-align: right;
              padding-right: 30px;
              color: #666;
            }
            
            .subtotal-value {
              width: 120px;
              text-align: right;
              font-weight: 600;
            }
            
            .total-row {
              background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
              color: white;
              padding: 15px 0;
              margin-top: 10px;
              border-radius: 8px;
              display: flex;
              justify-content: flex-end;
              font-size: 18px;
              font-weight: bold;
            }
            
            .total-row .subtotal-label {
              color: white;
              font-size: 18px;
            }
            
            .total-row .subtotal-value {
              font-size: 24px;
            }
            
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 30px;
              border-top: 2px solid #e0e0e0;
              color: #999;
              font-size: 14px;
            }
            
            .footer-message {
              font-size: 16px;
              color: #8B5CF6;
              font-weight: 600;
              margin-bottom: 10px;
            }
            
            .notes {
              margin-top: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-left: 4px solid #8B5CF6;
              border-radius: 4px;
            }
            
            .notes-title {
              font-weight: bold;
              color: #8B5CF6;
              margin-bottom: 8px;
              font-size: 14px;
            }
            
            .notes-content {
              font-size: 13px;
              color: #666;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="business-name">${businessName || 'Your Business'}</div>
              <div class="receipt-title">${title || 'INVOICE'}</div>
            </div>
            
            <div class="invoice-details">
              <div class="detail-block">
                <div class="detail-label">Invoice Number</div>
                <div class="detail-value">${receiptNumber}</div>
              </div>
              <div class="detail-block">
                <div class="detail-label">Date Issued</div>
                <div class="detail-value">${today}</div>
              </div>
            </div>
            
            <div class="content">
              <table>
                <thead>
                  <tr>
                    <th style="width: 8%;">#</th>
                    <th style="width: 40%;">Description</th>
                    <th style="width: 12%; text-align: center;">Qty</th>
                    <th style="width: 20%; text-align: right;">Unit Price</th>
                    <th style="width: 20%; text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
              
              <div class="subtotal-section">
                <div class="total-row">
                  <div class="subtotal-label">TOTAL DUE</div>
                  <div class="subtotal-value">${total.toFixed(2)}</div>
                </div>
              </div>
              
              <div class="notes">
                <div class="notes-title">Payment Terms</div>
                <div class="notes-content">
                  Payment is due upon receipt. Thank you for your business!
                </div>
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-message">Thank You For Your Business!</div>
              <div>For questions about this invoice, please contact us.</div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const generatePDF = async (): Promise<void> => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a receipt title');
      return;
    }

    const validItems = items.filter(item => item.product.trim() !== '');
    if (validItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    try {
      const html = generateHTML();
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Success', 'PDF created but sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF: ' + (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <FontAwesome5 name="receipt" size={32} color="#8B5CF6" />
          <Text style={styles.headerText}>Create Receipt</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Ionicons name="business" size={18} color="#555" />
            <Text style={styles.label}>Business Name</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter business name"
            value={businessName}
            onChangeText={setBusinessName}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <MaterialIcons name="title" size={18} color="#555" />
            <Text style={styles.label}>Receipt Title *</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="e.g., Invoice #001, Sales Receipt"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.itemsHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="list" size={22} color="#333" />
            <Text style={styles.sectionTitle}>Items</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputHeaderRow}>
          <Text style={[styles.inputHeader, styles.productInputHeader]}>Product</Text>
          <Text style={[styles.inputHeader, styles.quantityInputHeader]}>Qty</Text>
          <Text style={[styles.inputHeader, styles.amountInputHeader]}>Price</Text>
          <View style={styles.removeHeaderPlaceholder} />
        </View>

        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemInputContainer}>
              <TextInput
                style={[styles.input, styles.productInput]}
                placeholder="Name"
                value={item.product}
                onChangeText={(value) => updateItem(index, 'product', value)}
              />
              <TextInput
                style={[styles.input, styles.quantityInput]}
                placeholder="1"
                value={item.quantity}
                onChangeText={(value) => updateItem(index, 'quantity', value)}
                keyboardType="numeric"
                textAlign="center"
              />
              <TextInput
                style={[styles.input, styles.amountInput]}
                placeholder="0.00"
                value={item.amount}
                onChangeText={(value) => updateItem(index, 'amount', value)}
                keyboardType="decimal-pad"
                textAlign="right"
              />
            </View>
            {items.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(index)}
              >
                <Ionicons name="close-circle" size={28} color="#fff" />
              </TouchableOpacity>
            )}
            {items.length === 1 && <View style={styles.removeHeaderPlaceholder} />}
          </View>
        ))}

        <View style={styles.totalContainer}>
          <View style={styles.totalLabelRow}>
            <FontAwesome5 name="calculator" size={18} color="#333" />
            <Text style={styles.totalLabel}>Total:</Text>
          </View>
          <Text style={styles.totalAmount}>₦{calculateTotal().toFixed(2)}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.generateButton} onPress={generatePDF}>
          <Ionicons name="document-text" size={22} color="#fff" />
          <Text style={styles.generateButtonText}>Generate & Share PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
    gap: 12,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 2,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  inputHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  productInputHeader: {
    flex: 1,
    paddingLeft: 12,
    minWidth: 120,
  },
  quantityInputHeader: {
    width: 70,
    textAlign: 'center',
    marginLeft: 8,
  },
  amountInputHeader: {
    width: 90,
    textAlign: 'right',
    marginLeft: 8,
    paddingRight: 12,
  },
  removeHeaderPlaceholder: {
    width: 42,
    marginLeft: 10,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  itemInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productInput: {
    flex: 1,
    paddingVertical: 10,
    minWidth: 120,
  },
  quantityInput: {
    width: 70,
    paddingVertical: 10,
  },
  amountInput: {
    width: 90,
    paddingVertical: 10,
  },
  removeButton: {
    marginLeft: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#333',
  },
  totalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  generateButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});