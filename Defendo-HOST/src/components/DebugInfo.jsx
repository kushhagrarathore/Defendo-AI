import { useLocation } from 'react-router-dom'

const DebugInfo = () => {
  const location = useLocation()
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded-lg font-mono z-50">
      <div>Path: {location.pathname}</div>
      <div>Search: {location.search}</div>
      <div>Hash: {location.hash}</div>
    </div>
  )
}

export default DebugInfo
