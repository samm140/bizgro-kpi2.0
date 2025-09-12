// Handle edit
const handleEdit = (id, updatedData) => {
  // Update in local state
  setHistoricalData(prev => 
    prev.map(item => item.id === id ? updatedData : item)
  );
  
  // Update in Google Sheets
  googleSheetsService.updateCells(
    spreadsheetId,
    `A${rowIndex}:R${rowIndex}`,
    [Object.values(updatedData)]
  );
};

// Handle delete
const handleDelete = (id) => {
  setHistoricalData(prev => prev.filter(item => item.id !== id));
  // Also delete from Google Sheets if needed
};

// Render historical view
<HistoricalDataView 
  data={historicalData}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
