import { motion } from 'framer-motion'
import Button from '../components/Button'

export default function NotFound() {
  return (
    <div className="px-6 py-32 max-w-xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <p className="text-xs tracking-[0.2em] uppercase text-blood-red mb-4 font-medium">Lost?</p>
        <div className="w-12 h-px bg-blood-red mx-auto mb-8" />
        <h1 className="font-display text-7xl md:text-9xl text-deep-space-blue mb-4 leading-none">404</h1>
        <p className="text-body text-onyx mb-10">That page doesn't exist.</p>
        <Button to="/">Back to Home</Button>
      </motion.div>
    </div>
  )
}
