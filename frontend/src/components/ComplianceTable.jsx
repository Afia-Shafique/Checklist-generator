import React from 'react';

const ComplianceTable = () => {
  const complianceData = [
    {
      specification: "Foundation Specifications",
      status: "APPROVED",
      actions: "View Details"
    },
    {
      specification: "Electrical Systems",
      status: "PENDING REVIEW",
      actions: "View Details"
    },
    {
      specification: "Plumbing Standards",
      status: "REJECTED",
      actions: "View Details"
    },
    {
      specification: "HVAC Requirements",
      status: "APPROVED",
      actions: "View Details"
    },
    {
      specification: "Safety Protocols",
      status: "PENDING REVIEW",
      actions: "View Details"
    }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "status-approved";
      case "PENDING REVIEW":
        return "status-pending";
      case "REJECTED":
        return "status-rejected";
      default:
        return "status-pending";
    }
  };

  const handleViewDetails = (specification) => {
    console.log(`Viewing details for: ${specification}`);
    // Add your view details logic here
  };

  const handleUploadSpecification = () => {
    console.log('Upload Specification clicked');
    // Add your upload logic here
  };

  const handleExportReport = () => {
    console.log('Export Report clicked');
    // Add your export logic here
  };

  const handleGenerateReport = () => {
    console.log('Generate Report clicked');
    // Add your generate report logic here
  };

  return (
    <div className="compliance-section">
      <h2 className="section-title">Compliance Checklist</h2>
      <div className="table-container">
        <table className="compliance-table">
          <thead>
            <tr>
              <th>Specification</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complianceData.map((item, index) => (
              <tr key={index}>
                <td>{item.specification}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="action-button"
                    onClick={() => handleViewDetails(item.specification)}
                  >
                    {item.actions}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="action-buttons">
        <button className="btn btn-upload" onClick={handleUploadSpecification}>
          <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Upload Specification
        </button>
        <button className="btn btn-export" onClick={handleExportReport}>
          <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export Report
        </button>
        <button className="btn btn-generate" onClick={handleGenerateReport}>
          <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default ComplianceTable;
