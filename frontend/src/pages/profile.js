import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('profile')
  const [addressForm, setAddressForm] = useState({
    label: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false
  })

  const { data: addresses } = useQuery('addresses', () =>
    fetch('/api/v1/users/addresses', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.json())
  )

  const addAddress = useMutation((data) =>
    fetch('/api/v1/users/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    }), {
      onSuccess: () => {
        queryClient.invalidateQueries('addresses')
        setAddressForm({
          label: '',
          line1: '',
          line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
          is_default: false
        })
      }
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    addAddress.mutate(addressForm)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'profile' ? 'border-b-2 border-indigo-600' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'addresses' ? 'border-b-2 border-indigo-600' : ''}`}
          onClick={() => setActiveTab('addresses')}
        >
          Addresses
        </button>
      </div>

      {activeTab === 'profile' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="bg-white p-6 rounded shadow">
            <p><strong>Name:</strong> {user?.full_name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
          </div>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Addresses</h2>
          
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Label (Home, Work, etc.)"
                value={addressForm.label}
                onChange={(e) => setAddressForm({...addressForm, label: e.target.value})}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Address Line 1"
                value={addressForm.line1}
                onChange={(e) => setAddressForm({...addressForm, line1: e.target.value})}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Address Line 2"
                value={addressForm.line2}
                onChange={(e) => setAddressForm({...addressForm, line2: e.target.value})}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="City"
                value={addressForm.city}
                onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="State"
                value={addressForm.state}
                onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={addressForm.postal_code}
                onChange={(e) => setAddressForm({...addressForm, postal_code: e.target.value})}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Country"
                value={addressForm.country}
                onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                className="border rounded px-3 py-2"
                required
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={addressForm.is_default}
                  onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})}
                  className="mr-2"
                />
                Set as default address
              </label>
            </div>
            <button
              type="submit"
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Add Address
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses?.map(address => (
              <div key={address.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold">{address.label}</h3>
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>{address.city}, {address.state} {address.postal_code}</p>
                <p>{address.country}</p>
                {address.is_default && <span className="text-sm text-green-600">Default</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}