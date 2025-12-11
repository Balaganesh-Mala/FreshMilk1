import { useEffect, useState } from "react";
import { fetchProfile, cancelSubscription } from "../api/project.api";
import { FaTrash } from "react-icons/fa";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSubs = async () => {
    setLoading(true);
    const res = await fetchProfile();
    setSubs(res.data.user.subscriptions || []);
    setLoading(false);
  };

  const cancelSub = async (subId) => {
    try {
      await cancelSubscription({ subId });
      loadSubs();
    } catch {
      alert("Cancel failed");
    }
  };

  useEffect(() => {
    loadSubs();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  if (!subs.length)
    return <div className="text-center py-20 text-gray-500">No subscriptions</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold text-blue-900 mb-6">My Subscriptions</h2>

      <div className="grid gap-6">
        {subs.map((sub, idx) => (
          <div key={idx} className="bg-white shadow rounded-xl p-6 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">{sub.productName}</p>
              <p className="text-gray-600 text-sm">
                Size: {sub.variantSize} | Plan: {sub.plan}
              </p>
              <p className="text-green-600 text-sm">Status: {sub.status}</p>
            </div>

            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => cancelSub(sub._id)}
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
