import { motion } from 'framer-motion'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

const ChartsSection = ({ data = [] }) => {
  // Sample data - replace with real data from props
  const chartData = data.length > 0 ? data : [
    { name: 'Jan', bookings: 12, revenue: 24000 },
    { name: 'Feb', bookings: 19, revenue: 38000 },
    { name: 'Mar', bookings: 15, revenue: 30000 },
    { name: 'Apr', bookings: 22, revenue: 44000 },
    { name: 'May', bookings: 18, revenue: 36000 },
    { name: 'Jun', bookings: 25, revenue: 50000 }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1a241e] border border-white/20 rounded-lg p-3 shadow-xl"
        >
          <p className="text-white font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </motion.div>
      )
    }
    return null
  }

  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Bookings Chart */}
      <motion.div
        className="rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-xl font-bold mb-4 text-white">Monthly Bookings</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="bookings" fill="url(#bookingsGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-color)" />
                  <stop offset="100%" stopColor="var(--primary-color)" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        className="rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-xl font-bold mb-4 text-white">Revenue Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary-color)" fill="url(#revenueGradient)" strokeWidth={2} />
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-color)" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="var(--primary-color)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ChartsSection



