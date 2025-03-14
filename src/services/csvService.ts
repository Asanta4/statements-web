/**
 * CSV Processing Service
 * 
 * This service handles CSV processing operations including:
 * - Parsing and cleaning CSV data
 * - Applying GPT-4o based transformations
 * - Generating the final modified CSV
 */

import { ProcessedCSV, ImageAnalysisResult, ReasonMapping } from '../types';

/**
 * Process a raw CSV file according to the specified rules
 * 
 * @param csvFile The CSV file to process
 * @returns Promise with the processed CSV data
 */
export const processCSV = (csvData: any[]): ProcessedCSV => {
  // A1: Delete "Account Running Balance" column
  // A2: Delete all rows with a non-empty "Credit" value
  // A3: Add "Check Name" + "Reason" columns
  // A4: Remove "Credit" column
  // A5: Remove unnamed last column
  // A6: Keep rows with empty check numbers or whole integer check numbers

  const headers = ['Date', 'Description', 'Debit', 'Check Number', 'Check Name', 'Reason'];
  
  const rows = csvData
    .filter((row: any) => {
      // Filter out rows with credit values
      if (row.Credit && row.Credit.trim() !== '') return false;
      
      // Get the check number as a string
      const checkNumStr = String(row['Check Number'] || '').trim();
      
      // If check number is empty, keep the row
      if (!checkNumStr) return true;
      
      // If check number is not a valid number, filter it out
      if (isNaN(Number(checkNumStr))) return false;
      
      // Check if it's a whole number (no decimal part)
      const checkNum = parseFloat(checkNumStr);
      return Number.isInteger(checkNum) && checkNum > 0;
    })
    .map((row: any) => ({
      date: row.Date,
      description: row.Description,
      debit: row.Debit,
      checkNumber: row['Check Number'] || '',
      checkName: '',
      reason: ''
    }));

  return { headers, rows };
};

/**
 * Assign reasons to transactions based on the mapping rules
 * 
 * @param description Transaction description
 * @param checkName Check payee name
 * @param mappings List of reason mappings
 * @returns The assigned reason or empty string
 */
export const assignReason = (
  description: string, 
  checkName: string, 
  mappings: ReasonMapping[]
): string => {
  const searchText = `${description} ${checkName}`.toUpperCase();
  let bestMatch: ReasonMapping | null = null;
  let bestMatchLength = 0;

  for (const mapping of mappings) {
    const upperSearchTerm = mapping.searchTerm.toUpperCase();
    if (searchText.includes(upperSearchTerm)) {
      if (mapping.searchTerm.length > bestMatchLength) {
        bestMatch = mapping;
        bestMatchLength = mapping.searchTerm.length;
      }
    }
  }

  return bestMatch?.reason || '';
};

/**
 * Generate the final CSV with check names and reasons
 * 
 * @param processedCSV The processed CSV data
 * @param checkImages The analyzed check images
 * @param reasonMappings The reason mapping rules
 * @returns CSV string ready for download
 */
export const generateFinalCSV = (
  processedCSV: ProcessedCSV,
  checkImages: ImageAnalysisResult[],
  reasonMappings: ReasonMapping[]
): string => {
  // Create a copy of the processed CSV
  const finalCSV = {
    headers: [...processedCSV.headers],
    rows: [...processedCSV.rows]
  };

  // Update check names and assign reasons
  finalCSV.rows = finalCSV.rows.map(row => {
    const matchingImage = checkImages.find(
      img => img.checkNumber === row.checkNumber
    );

    if (matchingImage) {
      row.checkName = matchingImage.checkName;
    }
    
    row.reason = assignReason(row.description, row.checkName || '', reasonMappings);

    return row;
  });

  // Convert to CSV string
  return [
    finalCSV.headers.join(','),
    ...finalCSV.rows.map(row => 
      [
        row.date,
        row.description,
        row.debit,
        row.checkNumber,
        row.checkName || '',
        row.reason || ''
      ].join(',')
    )
  ].join('\n');
};

export default {
  processCSV,
  assignReason,
  generateFinalCSV
}; 