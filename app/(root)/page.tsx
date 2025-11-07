"use client";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus, RefreshCcw } from "lucide-react";
import { getApiBase } from "@/lib/apiBase";
import CreateUserDialog from "@/components/user-dashboard/create-user-page";
import UpdateUserDialog from "@/components/user-dashboard/update-user-page";
import UserDetailsPage from "@/components/user-dashboard/user-details.page";

export default function UserDashboardPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [createUser, setCreateUser] = useState(false);
  const [updateUser, setUpdateUser] = useState(false);
  const [userDetails, setUserDetails] = useState(false);
  const [patientIds, setPatientIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // ✅ Fetch all patients
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/users/patient-details`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load patients");
      setPatients(data.patients || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientIds = async () => {
    try {
      const baseUrl = getApiBase();
      const res = await fetch(`${baseUrl}/users/patient-ids`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed to fetch patient IDs");
      setPatientIds(data.userIds || []);
    } catch (err: any) {
      console.error("Error fetching patient IDs:", err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div className="overflow-y-auto scrollbar-hide overflow-x-hidden h-[calc(100vh-6rem)] sm:h-[calc(100vh-6rem)] md:h-[calc(100vh-9rem)] lg:h-[calc(100vh-8rem)] xl:h-[calc(100vh-6.8rem)] 2xl:h-[calc(100vh-6.8rem)] w-full bg-white dark:bg-gray-900 space-y-2 2xl:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 w-[var(--sidebar-width)]">
          <SidebarTrigger />
          <div className="w-[2px] h-6 bg-gray-400" />
          <span className="xl:text-lg 2xl:text-xl font-semibold text-gray-700">Home Page</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-3 2xl:gap-5">
          <button 
            onClick={() => setCreateUser(true)}
            className="flex cursor-pointer items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-md shadow hover:bg-gray-800 transition-colors xl:text-sm 2xl:text-base font-medium"
          >
            <Plus className="w-4 h-4" />
            Create User
          </button>
          <button
            onClick={async () => {
              await fetchPatientIds(); // ✅ fetch IDs when the button is clicked
              setUpdateUser(true);     // ✅ open the dialog afterward
            }}
            className="flex cursor-pointer items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-md shadow hover:bg-gray-800 transition-colors xl:text-sm 2xl:text-base font-medium"
          >
            <RefreshCcw className="w-4 h-4" />
            Update User
          </button>
        </div>
      </div>

      {createUser && (
        <CreateUserDialog open={createUser} onOpenChange={setCreateUser} />
      )}

      {updateUser && (
        <UpdateUserDialog
          open={updateUser}
          onOpenChange={setUpdateUser}
          patientIds={patientIds} // ✅ pass fetched IDs
        />
      )}

      {/* Section Header */}
      <div className="flex items-center mt-4 xl:mt-6 2xl:mt-6">
        <div>
          <span className="xl:text-lg 2xl:text-xl font-semibold text-gray-700">
            User Dashboard
          </span>
          <p className="text-sm text-gray-500">
            Overview of all registered patients and their key details.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="mt-10 xl:mt-6 2xl:mt-16">
        <div className="rounded-xl shadow border border-gray-300 bg-white dark:bg-gray-900 overflow-x-auto">
          {loading ? (
            <div className="p-6 text-gray-500 text-center italic">Loading patient data...</div>
          ) : error ? (
            <div className="p-6 text-red-500 text-center">{error}</div>
          ) : patients.length === 0 ? (
            <div className="p-6 text-gray-500 text-center italic">No patients found.</div>
          ) : (
            <div className="overflow-auto max-h-[calc(100vh-16rem)]">
              <table className="min-w-full text-sm text-center">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-4 border-b border-gray-300">User ID</th>
                    <th className="px-4 py-4 border-b border-gray-300">Name</th>
                    <th className="px-4 py-4 border-b border-gray-300">Diagnosis</th>
                    <th className="px-4 py-4 border-b border-gray-300">Age</th>
                    <th className="px-4 py-4 border-b border-gray-300">Start Date</th>
                    <th className="px-4 py-4 border-b border-gray-300">Last Login</th>
                    <th className="px-4 py-4 border-b border-gray-300">Week No</th>
                    <th className="px-4 py-4 border-b border-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr
                      key={p.uid}
                      onClick={() => {
                        setSelectedUser(p); // ✅ store clicked patient
                        setUserDetails(true); // ✅ open user details modal
                      }}
                      className="even:bg-gray-50 dark:even:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                      <td className="px-4 py-4 border-b border-gray-300">{p.uid}</td>
                      <td className="px-4 py-4 border-b border-gray-300">{p.name}</td>
                      <td className="px-4 py-4 border-b border-gray-300">{p.diagnosis}</td>
                      <td className="px-4 py-4 border-b border-gray-300">{p.age ?? "-"}</td>
                      <td className="px-4 py-4 border-b border-gray-300">
                        {p.startDate ? new Date(p.startDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-4 border-b border-gray-300">
                        {p.lastLogin ? new Date(p.lastLogin).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-4 border-b border-gray-300">{p.weekNo}</td>
                      <td className="px-4 py-4 border-b border-gray-300">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {userDetails && selectedUser && (
        <UserDetailsPage
          open={userDetails}
          onOpenChange={setUserDetails}
          user={selectedUser}
        />
      )}
    </div>
  );
}