// Submit data to Google Sheets
const handleSubmit = async (formData) => {
  const result = await googleSheetsService.submitWeeklyData(
    formData,
    process.env.VITE_GOOGLE_SHEETS_ID
  );
  
  if (result.success) {
    console.log('Data submitted successfully');
  }
};

// Fetch historical data
const fetchHistory = async () => {
  const data = await googleSheetsService.getHistoricalData(
    process.env.VITE_GOOGLE_SHEETS_ID
  );
  setHistoricalData(data);
};
