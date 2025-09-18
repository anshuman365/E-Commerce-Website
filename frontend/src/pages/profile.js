import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-toastify'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('profile')
  const [editMode, setEditMode] = useState(false)
  const [userForm, setUserForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })
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

  const { data: addresses, isLoading: addressesLoading } = useQuery(
    'addresses',
    () => fetch('/api/v1/users/addresses', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.json()),
    { enabled: !!user }
  )

  const updateProfileMutation = useMutation(updateProfile, {
    onSuccess: () => {
      setEditMode(false)
    }
  })

  const addAddress = useMutation(
    (data) =>
      fetch('/api/v1/users/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      }),
    {
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
        toast.success('Address added successfully!')
      },
      onError: (error) => {
        toast.error('Failed to add address')
      }
    }
  )

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate(userForm)
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    addAddress.mutate(addressForm)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Please log in to view your profile</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'addresses' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('addresses')}
        >
          Addresses
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            {!editMode && (
              <button
                onClick={() => {
                  setEditMode(true)
                  setUserForm({
                    full_name: user.full_name,
                    email: user.email,
                    phone: user.phone || ''
                  })
                }}
                className="btn-secondary"
              >
                Edit Profile
              </button>
            )}
          </div>
          
          {editMode ? (
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={userForm.full_name}
                    onChange={(e) => setUserForm({...userForm, full_name: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={updateProfileMutation.isLoading}
                >
                  {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <p><strong>Name:</strong> {user.full_name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Your Addresses</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
            <form onSubmit={handleAddressSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Label (Home, Work, etc.)</label>
                  <input
                    type="text"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({...addressForm, label: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Address Line 1</label>
                  <input
                    type="text"
                    value={addressForm.line1}
                    onChange={(e) => setAddressForm({...addressForm, line1: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={addressForm.line2}
                    onChange={(e) => setAddressForm({...addressForm, line2: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    value={addressForm.postal_code}
                    onChange={(e) => setAddressForm({...addressForm, postal_code: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Set as default address
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 btn-primary"
                disabled={addAddress.isLoading}
              >
                {addAddress.isLoading ? 'Adding...' : 'Add Address'}
              </button>
            </form>
          </div>

          {addressesLoading ? (
            <div className="flex justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses?.length > 0 ? (
                addresses.map(address => (
                  <div key={address.id} className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{address.label}</h3>
                      {address.is_default && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p>{address.line1}</p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                    <p>{address.country}</p>
                    <div className="mt-3 flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No addresses found. Add your first address above.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}