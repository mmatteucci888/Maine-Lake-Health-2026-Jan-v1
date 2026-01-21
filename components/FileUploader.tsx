
import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { LakeData } from '../types';
import { Icons } from '../constants';

interface FileUploaderProps {
  onDataLoaded: (data: LakeData[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList | null } }) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        if (typeof bstr !== 'string') return;

        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        // Grouping logic for historical data
        const lakeMap: Record<string, LakeData> = {};

        data.forEach((row: any, index: number) => {
          const lakeName = row.Name || row.Lake || 'Uploaded Lake';
          const year = row.Year || row.Date || row.SampleDate || '2024';
          const secchi = parseFloat(row.Secchi || row.Clarity || 5.0);
          const phos = parseFloat(row.Phosphorus || row.Phos || 10.0);

          // Fix: Added missing required 'maxDepth' property to satisfy LakeData interface
          if (!lakeMap[lakeName]) {
            lakeMap[lakeName] = {
              id: `upload-${Date.now()}-${index}`,
              name: lakeName,
              town: row.Town || 'Unknown',
              zipCode: String(row.Zip || '00000'),
              coordinates: { 
                lat: parseFloat(row.Latitude || row.Lat || 44.2139), 
                lng: parseFloat(row.Longitude || row.Lng || -70.5281) 
              },
              waterQuality: (row.Quality || 'Good') as any,
              lastSecchiDiskReading: secchi,
              phosphorusLevel: phos,
              chlorophyllLevel: parseFloat(row.Chlorophyll || 2.0),
              invasiveSpeciesStatus: (row.Invasive || 'None detected') as any,
              lastUpdated: String(year),
              maxDepth: parseFloat(row.MaxDepth || 10.0),
              historicalData: []
            };
          }

          lakeMap[lakeName].historicalData?.push({
            year,
            secchi,
            phosphorus: phos
          });
          
          // Ensure the primary metrics reflect the most recent data point
          if (String(year) >= String(lakeMap[lakeName].lastUpdated)) {
            lakeMap[lakeName].lastSecchiDiskReading = secchi;
            lakeMap[lakeName].phosphorusLevel = phos;
            lakeMap[lakeName].lastUpdated = String(year);
          }
        });

        onDataLoaded(Object.values(lakeMap));
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsBinaryString(file);
    });
  };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
      onDragLeave={() => setIsHovering(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsHovering(false);
        if (e.dataTransfer.files) {
          const fakeEvent = { target: { files: e.dataTransfer.files } };
          handleFileUpload(fakeEvent);
        }
      }}
      onClick={() => fileInputRef.current?.click()}
      className={`mt-6 p-4 border-2 border-dashed rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group ${
        isHovering ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
      }`}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".xlsx, .xls, .csv" 
        multiple
        className="hidden" 
      />
      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black text-white uppercase tracking-wider">Historical Import</p>
        <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Multi-year XLSX/CSV</p>
      </div>
    </div>
  );
};

export default FileUploader;
