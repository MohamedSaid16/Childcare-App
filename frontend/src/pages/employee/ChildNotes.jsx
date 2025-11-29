import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeeAPI } from '../../utils/api';
import { FaPlus, FaChild, FaStickyNote, FaSearch, FaUserEdit } from 'react-icons/fa';

const ChildNotes = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [noteForm, setNoteForm] = useState({
    childId: '',
    category: 'general',
    content: '',
    isImportant: false
  });

  useEffect(() => {
    loadChildren();
    loadNotes();
  }, []);

  const loadChildren = async () => {
    try {
      const response = await employeeAPI.getClassroomChildren();
      setChildren(response.data.data);
    } catch (error) {
      console.error('Failed to load children:', error);
    }
  };

  const loadNotes = async () => {
    try {
      const response = await employeeAPI.getMyNotes();
      setNotes(response.data.data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    try {
      await employeeAPI.createNote(noteForm);
      setShowNoteForm(false);
      setNoteForm({
        childId: '',
        category: 'general',
        content: '',
        isImportant: false
      });
      loadNotes();
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      behavior: 'bg-yellow-100 text-yellow-800',
      academic: 'bg-blue-100 text-blue-800',
      health: 'bg-red-100 text-red-800',
      milestone: 'bg-green-100 text-green-800'
    };
    return colors[category] || colors.general;
  };

  const filteredChildren = children.filter(child =>
    child.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotes = selectedChild 
    ? notes.filter(note => note.child._id === selectedChild._id)
    : notes;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Child Notes</h1>
              <p className="mt-1 text-sm text-gray-600">
                Record observations and notes about children
              </p>
            </div>
            <button
              onClick={() => setShowNoteForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" />
              Add Note
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Children List */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Children</h2>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search children..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  <button
                    onClick={() => setSelectedChild(null)}
                    className={`w-full text-left px-6 py-3 hover:bg-gray-50 ${
                      !selectedChild ? 'bg-indigo-50 text-indigo-700' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <FaStickyNote className="h-5 w-5 text-gray-400 mr-3" />
                      <span>All Notes</span>
                    </div>
                  </button>
                  {filteredChildren.map((child) => (
                    <button
                      key={child._id}
                      onClick={() => setSelectedChild(child)}
                      className={`w-full text-left px-6 py-3 hover:bg-gray-50 ${
                        selectedChild?._id === child._id ? 'bg-indigo-50 text-indigo-700' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <FaChild className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{child.firstName} {child.lastName}</p>
                          <p className="text-xs text-gray-500">Age: {child.age}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes List */}
            <div className="lg:col-span-3">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedChild 
                      ? `Notes for ${selectedChild.firstName} ${selectedChild.lastName}`
                      : 'All Notes'
                    }
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {filteredNotes.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <FaStickyNote className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No notes found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {selectedChild 
                          ? `No notes for ${selectedChild.firstName} yet.`
                          : 'No notes have been recorded yet.'
                        }
                      </p>
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <div key={note._id} className="px-6 py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
                                {note.category}
                              </span>
                              {note.isImportant && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Important
                                </span>
                              )}
                              <span className="text-sm text-gray-500">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-900">{note.content}</p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <FaUserEdit className="mr-1" />
                              <span>By {note.employee?.firstName} {note.employee?.lastName}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Note Form Modal */}
          {showNoteForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add Child Note</h3>
                  <form onSubmit={handleSubmitNote} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Child</label>
                      <select
                        required
                        value={noteForm.childId}
                        onChange={(e) => setNoteForm({...noteForm, childId: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      >
                        <option value="">Select a child</option>
                        {children.map(child => (
                          <option key={child._id} value={child._id}>
                            {child.firstName} {child.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <select
                        value={noteForm.category}
                        onChange={(e) => setNoteForm({...noteForm, category: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      >
                        <option value="general">General</option>
                        <option value="behavior">Behavior</option>
                        <option value="academic">Academic</option>
                        <option value="health">Health</option>
                        <option value="milestone">Milestone</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Note</label>
                      <textarea
                        required
                        value={noteForm.content}
                        onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows="4"
                        placeholder="Enter your observations..."
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={noteForm.isImportant}
                        onChange={(e) => setNoteForm({...noteForm, isImportant: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Mark as important
                      </label>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowNoteForm(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                      >
                        Save Note
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildNotes;