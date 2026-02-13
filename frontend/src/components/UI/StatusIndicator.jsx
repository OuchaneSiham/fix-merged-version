const StatusIndicator = ({ getStatusColor }) => {
    return (
      <div 
        className={`absolute ${getStatusColor()} z-10 h-4 w-4 rounded-full border-2 border-[#3E3D38] bottom-0 right-0`}
      />
    );
  };
  
export default StatusIndicator;