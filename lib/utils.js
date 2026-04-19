import crypto from 'crypto'

export function randomId() {
  return crypto.randomBytes(8).toString('hex')
}

export function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-KE').format(amount)
}
