"use client";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa6';
import Link from 'next/link';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const searchTimeout = useRef(null);
  const searchInputRef = useRef(null);
  
  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);
  
  // Clear results when overlay closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
      setPage(1);
      setHasMore(false);
      setTotal(0);
      setError('');
    }
  }, [isOpen]);
  
  // Handle search with debounce
  useEffect(() => {
    if (searchTerm.length >= 2) {
      // Clear any existing timeout
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      
      // Set new timeout for 1 second
      searchTimeout.current = setTimeout(() => {
        performSearch();
      }, 1000);
    } else {
      setResults([]);
      setHasMore(false);
      setTotal(0);
      if (searchTerm.length > 0) {
        setError('Please enter at least 2 characters');
      } else {
        setError('');
      }
    }
    
    // Cleanup timeout on component unmount or searchTerm change
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm]);
  
  const performSearch = async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError('');
      
      const currentPage = isLoadMore ? page + 1 : 1;
      if (!isLoadMore) {
        setResults([]);
      }
      
      const response = await axios.get(`/api/quiz/search?term=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=15`);
      
      if (response.data.success) {
        if (isLoadMore) {
          setResults(prev => [...prev, ...response.data.quizzes]);
        } else {
          setResults(response.data.quizzes);
        }
        setHasMore(response.data.hasMore);
        setTotal(response.data.total);
        setPage(currentPage);
      } else {
        setError(response.data.message || 'Failed to search quizzes');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };
  
  const loadMore = () => {
    if (hasMore && !loading) {
      performSearch(true);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const formatDuration = (seconds) => {
    if (!seconds) return 'No time limit';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    } else {
      return `${minutes}m`;
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 backdrop-blur-sm flex flex-col">
      <div className="w-full flex flex-col p-4 bg-base-100 min-h-screen">
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quizzes..."
              className="input input-bordered w-full pr-10"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <FaSearch />
              )}
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost ml-2">
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        {error && <p className="text-error text-sm mb-4">{error}</p>}
        
        {searchTerm.length >= 2 && !loading && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-4">
            <p className="text-lg mb-2">No quizzes found</p>
            <p className="text-sm opacity-70">Try a different search term</p>
          </div>
        )}
        
        {results.length > 0 && (
          <>
            <p className="text-sm opacity-70 mb-4">Found {total} quiz{total !== 1 ? 'zes' : ''}</p>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {results.map((quiz) => (
                <div key={quiz._id} className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="card-title text-lg font-medium mb-1">{quiz.title}</h3>
                      <div className="badge badge-accent badge-sm">{quiz.level}</div>
                    </div>
                    
                    <p className="text-sm opacity-80 line-clamp-2 mb-2">{quiz.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {quiz.type && quiz.type.map((type, index) => (
                        <div key={index} className="badge badge-outline badge-sm">{type}</div>
                      ))}
                      {quiz.category && <div className="badge badge-outline badge-sm">{quiz.category}</div>}
                      <div className="badge badge-outline badge-sm">{quiz.language}</div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs opacity-70">
                      <span>{quiz.total_questions} question{quiz.total_questions !== 1 ? 's' : ''}</span>
                      <span>{formatDuration(quiz.duration)}</span>
                      <span>{formatDate(quiz.createdAt)}</span>
                    </div>
                    
                    <div className="card-actions justify-end mt-3">
                      <Link href={`dashboard/quiz/${quiz._id}/view`} className="btn btn-primary btn-sm">
                        Take Quiz <FaArrowRight className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center pb-4">
                <button 
                  onClick={loadMore} 
                  className="btn btn-outline"
                  disabled={loading}
                >
                  {loading ? <span className="loading loading-spinner loading-sm"></span> : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;