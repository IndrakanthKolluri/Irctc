import Input from './Input.jsx'

// Show fields that match the chosen saved or simulated payment method.
export default function PaymentMethodFields({
  method,
  setMethod,
  savedPayment,
  setSavedPayment,
  savedCards,
  savedUpiIds,
  newCard,
  setNewCard,
  newUpi,
  setNewUpi,
}) {
  return (
    <>
      <label className="block text-sm font-medium">Payment method
        <select className="mt-1 block w-full rounded-md border p-2" value={method} onChange={(event) => { setMethod(event.target.value); setSavedPayment('') }}>
          <option>UPI</option><option>Saved UPI</option><option>New Card</option><option>Saved Card</option><option>Net Banking</option>
        </select>
      </label>
      {method === 'UPI' && <Input id="payment-upi" label="UPI ID" value={newUpi} onChange={(event) => setNewUpi(event.target.value)} placeholder="name@bank" required />}
      {method === 'Saved UPI' && (
        <label className="mt-4 block text-sm font-medium">Saved UPI ID
          <select className="mt-1 block w-full rounded-md border p-2" value={savedPayment} onChange={(event) => setSavedPayment(event.target.value)}>
            <option value="">Choose saved UPI</option>{savedUpiIds.map((upi) => <option key={upi}>{upi}</option>)}
          </select>
        </label>
      )}
      {method === 'Saved Card' && (
        <label className="mt-4 block text-sm font-medium">Saved card
          <select className="mt-1 block w-full rounded-md border p-2" value={savedPayment} onChange={(event) => setSavedPayment(event.target.value)}>
            <option value="">Choose saved card</option>{savedCards.map((card) => <option key={card.id} value={card.id}>{card.holder} ···· {card.last4}</option>)}
          </select>
        </label>
      )}
      {method === 'New Card' && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input id="card-holder" label="Cardholder name" value={newCard.holder} onChange={(event) => setNewCard({ ...newCard, holder: event.target.value })} />
          <Input id="card-number" label="Card number" inputMode="numeric" value={newCard.number} onChange={(event) => setNewCard({ ...newCard, number: event.target.value })} />
          <Input id="card-expiry" label="Expiry (MM/YY)" placeholder="MM/YY" value={newCard.expiry} onChange={(event) => setNewCard({ ...newCard, expiry: event.target.value })} />
          <Input id="card-cvv" label="CVV" type="password" value={newCard.cvv} onChange={(event) => setNewCard({ ...newCard, cvv: event.target.value })} />
        </div>
      )}
      {method === 'Net Banking' && (
        <label className="mt-4 block text-sm font-medium">Bank
          <select className="mt-1 block w-full rounded-md border p-2" value={savedPayment} onChange={(event) => setSavedPayment(event.target.value)}>
            <option value="">Choose bank</option><option>State Bank of India</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option>
          </select>
        </label>
      )}
    </>
  )
}
