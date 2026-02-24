import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Star, Filter } from 'lucide-react';
import { supabase } from '@/supabase-client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  is_approved: boolean;
  is_verified_purchase: boolean;
  created_at: string;
  products?: {
    name: string;
    main_image_url?: string;
  };
  profiles?: {
    username?: string;
    email: string;
  };
}

export default function AdminReviews() {
  const { tenant } = useParams<{ tenant: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (tenant) {
      loadReviews();
    }
  }, [tenant, filter]);

  const loadReviews = async () => {
    if (!tenant) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          products:product_id (
            name,
            main_image_url
          ),
          profiles:user_id (
            username,
            email
          )
        `)
        .eq('tenant', tenant)
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('is_approved', false);
      } else if (filter === 'approved') {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;
      toast.success('Review approved');
      loadReviews();
    } catch (error: any) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this review? It will be deleted.')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Review rejected and deleted');
      loadReviews();
    } catch (error: any) {
      console.error('Error rejecting review:', error);
      toast.error('Failed to reject review');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !review.is_approved;
    if (filter === 'approved') return review.is_approved;
    return false;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Review Moderation</h1>
          <p className="text-muted-foreground">Approve or reject customer reviews</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">No reviews found</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-card border rounded-lg p-6 ${
                !review.is_approved
                  ? 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20'
                  : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {review.products?.main_image_url ? (
                        <img
                          src={review.products.main_image_url}
                          alt={review.products.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{review.products?.name || 'Product'}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {review.profiles?.username || review.profiles?.email || 'Anonymous'}
                        {review.is_verified_purchase && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {review.title && (
                    <h4 className="font-medium mb-2">{review.title}</h4>
                  )}

                  {review.comment && (
                    <p className="text-muted-foreground mb-4">{review.comment}</p>
                  )}

                  {!review.is_approved && (
                    <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-md">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ This review is pending approval
                      </p>
                    </div>
                  )}
                </div>

                {!review.is_approved && (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleApprove(review.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(review.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {review.is_approved && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Approved</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}












