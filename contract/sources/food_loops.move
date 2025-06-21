module food_loops_addr::food_loops {
    use std::string::String;
    use std::vector;
    use std::option::{Self, Option};
    use std::signer;
    use std::timestamp;
    use aptos_framework::object::{Self, ExtendRef};
    use aptos_framework::account;

    // ======================== Data Structures ========================

    /// Represents a user review/feedback
    struct Review has store, drop, store {
        id: u64,
        user_address: address,
        rating: u8, // 1-5 stars
        title: String,
        comment: String,
        category: String, // e.g., "restaurant", "grocery", "delivery"
        timestamp: u64,
        helpful_votes: u64,
        reported: bool,
    }

    /// Stores all reviews for the platform
    struct ReviewStore has key {
        reviews: vector<Review>,
        next_review_id: u64,
        total_reviews: u64,
        average_rating: f64,
    }

    /// User profile with review statistics
    struct UserProfile has key {
        address: address,
        total_reviews: u64,
        average_rating_given: f64,
        helpful_votes_received: u64,
        last_review_timestamp: u64,
    }

    /// Stores review statistics by category
    struct CategoryStats has key {
        category: String,
        total_reviews: u64,
        average_rating: f64,
        reviews: vector<u64>, // review IDs
    }

    /// Global statistics
    struct GlobalStats has key {
        total_reviews: u64,
        total_users: u64,
        average_rating: f64,
        categories: vector<String>,
    }

    // ======================== Constants ========================

    const MAX_RATING: u8 = 5;
    const MIN_RATING: u8 = 1;
    const MAX_TITLE_LENGTH: u64 = 100;
    const MAX_COMMENT_LENGTH: u64 = 1000;
    const MAX_CATEGORY_LENGTH: u64 = 50;

    const ERROR_INVALID_RATING: u64 = 1;
    const ERROR_INVALID_TITLE: u64 = 2;
    const ERROR_INVALID_COMMENT: u64 = 3;
    const ERROR_INVALID_CATEGORY: u64 = 4;
    const ERROR_REVIEW_NOT_FOUND: u64 = 5;
    const ERROR_UNAUTHORIZED: u64 = 6;
    const ERROR_REVIEW_ALREADY_REPORTED: u64 = 7;

    // ======================== Events ========================

    struct ReviewSubmittedEvent has drop, store {
        review_id: u64,
        user_address: address,
        rating: u8,
        category: String,
        timestamp: u64,
    }

    struct ReviewVotedEvent has drop, store {
        review_id: u64,
        voter_address: address,
        helpful: bool,
        timestamp: u64,
    }

    struct ReviewReportedEvent has drop, store {
        review_id: u64,
        reporter_address: address,
        timestamp: u64,
    }

    // ======================== Initialization ========================

    fun init_module(sender: &signer) {
        let sender_addr = signer::address_of(sender);
        
        // Initialize global stats
        move_to(sender, GlobalStats {
            total_reviews: 0,
            total_users: 0,
            average_rating: 0.0,
            categories: vector::empty(),
        });

        // Initialize review store
        move_to(sender, ReviewStore {
            reviews: vector::empty(),
            next_review_id: 1,
            total_reviews: 0,
            average_rating: 0.0,
        });
    }

    // ======================== Entry Functions ========================

    /// Submit a new review
    public entry fun submit_review(
        sender: &signer,
        rating: u8,
        title: String,
        comment: String,
        category: String,
    ) acquires ReviewStore, GlobalStats, UserProfile {
        let sender_addr = signer::address_of(sender);
        
        // Validate inputs
        assert!(rating >= MIN_RATING && rating <= MAX_RATING, ERROR_INVALID_RATING);
        assert!(string::length(&title) <= MAX_TITLE_LENGTH, ERROR_INVALID_TITLE);
        assert!(string::length(&comment) <= MAX_COMMENT_LENGTH, ERROR_INVALID_COMMENT);
        assert!(string::length(&category) <= MAX_CATEGORY_LENGTH, ERROR_INVALID_CATEGORY);

        let review_store = borrow_global_mut<ReviewStore>(@food_loops_addr);
        let global_stats = borrow_global_mut<GlobalStats>(@food_loops_addr);
        
        let review_id = review_store.next_review_id;
        let current_timestamp = timestamp::now_seconds();

        // Create new review
        let new_review = Review {
            id: review_id,
            user_address: sender_addr,
            rating,
            title,
            comment,
            category,
            timestamp: current_timestamp,
            helpful_votes: 0,
            reported: false,
        };

        // Add review to store
        vector::push_back(&mut review_store.reviews, new_review);
        review_store.next_review_id = review_store.next_review_id + 1;
        review_store.total_reviews = review_store.total_reviews + 1;

        // Update global stats
        global_stats.total_reviews = global_stats.total_reviews + 1;
        update_average_rating(global_stats, review_store);

        // Add category if new
        if (!vector::contains(&global_stats.categories, &category)) {
            vector::push_back(&mut global_stats.categories, category);
        };

        // Update or create user profile
        update_user_profile(sender_addr, rating, current_timestamp);

        // Emit event
        event::emit(ReviewSubmittedEvent {
            review_id,
            user_address: sender_addr,
            rating,
            category,
            timestamp: current_timestamp,
        });
    }

    /// Vote on a review as helpful
    public entry fun vote_review_helpful(
        sender: &signer,
        review_id: u64,
    ) acquires ReviewStore {
        let sender_addr = signer::address_of(sender);
        let review_store = borrow_global_mut<ReviewStore>(@food_loops_addr);
        
        let review_index = find_review_index(review_store, review_id);
        assert!(review_index < vector::length(&review_store.reviews), ERROR_REVIEW_NOT_FOUND);
        
        let review = vector::borrow_mut(&mut review_store.reviews, review_index);
        review.helpful_votes = review.helpful_votes + 1;

        // Emit event
        event::emit(ReviewVotedEvent {
            review_id,
            voter_address: sender_addr,
            helpful: true,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Report a review as inappropriate
    public entry fun report_review(
        sender: &signer,
        review_id: u64,
    ) acquires ReviewStore {
        let sender_addr = signer::address_of(sender);
        let review_store = borrow_global_mut<ReviewStore>(@food_loops_addr);
        
        let review_index = find_review_index(review_store, review_id);
        assert!(review_index < vector::length(&review_store.reviews), ERROR_REVIEW_NOT_FOUND);
        
        let review = vector::borrow_mut(&mut review_store.reviews, review_index);
        assert!(!review.reported, ERROR_REVIEW_ALREADY_REPORTED);
        
        review.reported = true;

        // Emit event
        event::emit(ReviewReportedEvent {
            review_id,
            reporter_address: sender_addr,
            timestamp: timestamp::now_seconds(),
        });
    }

    // ======================== View Functions ========================

    #[view]
    public fun get_review_by_id(review_id: u64): Option<Review> acquires ReviewStore {
        let review_store = borrow_global<ReviewStore>(@food_loops_addr);
        let review_index = find_review_index(review_store, review_id);
        
        if (review_index < vector::length(&review_store.reviews)) {
            let review = vector::borrow(&review_store.reviews, review_index);
            option::some(*review)
        } else {
            option::none()
        }
    }

    #[view]
    public fun get_reviews_by_user(user_address: address): vector<Review> acquires ReviewStore {
        let review_store = borrow_global<ReviewStore>(@food_loops_addr);
        let user_reviews = vector::empty<Review>();
        let i = 0;
        
        while (i < vector::length(&review_store.reviews)) {
            let review = vector::borrow(&review_store.reviews, i);
            if (review.user_address == user_address) {
                vector::push_back(&mut user_reviews, *review);
            };
            i = i + 1;
        };
        
        user_reviews
    }

    #[view]
    public fun get_reviews_by_category(category: String): vector<Review> acquires ReviewStore {
        let review_store = borrow_global<ReviewStore>(@food_loops_addr);
        let category_reviews = vector::empty<Review>();
        let i = 0;
        
        while (i < vector::length(&review_store.reviews)) {
            let review = vector::borrow(&review_store.reviews, i);
            if (review.category == category) {
                vector::push_back(&mut category_reviews, *review);
            };
            i = i + 1;
        };
        
        category_reviews
    }

    #[view]
    public fun get_all_reviews(): vector<Review> acquires ReviewStore {
        let review_store = borrow_global<ReviewStore>(@food_loops_addr);
        *&review_store.reviews
    }

    #[view]
    public fun get_recent_reviews(limit: u64): vector<Review> acquires ReviewStore {
        let review_store = borrow_global<ReviewStore>(@food_loops_addr);
        let recent_reviews = vector::empty<Review>();
        let total_reviews = vector::length(&review_store.reviews);
        let start_index = if (total_reviews > limit) { total_reviews - limit } else { 0 };
        let i = start_index;
        
        while (i < total_reviews) {
            let review = vector::borrow(&review_store.reviews, i);
            vector::push_back(&mut recent_reviews, *review);
            i = i + 1;
        };
        
        recent_reviews
    }

    #[view]
    public fun get_user_profile(user_address: address): Option<UserProfile> {
        if (exists<UserProfile>(user_address)) {
            option::some(*borrow_global<UserProfile>(user_address))
        } else {
            option::none()
        }
    }

    #[view]
    public fun get_global_stats(): GlobalStats {
        *borrow_global<GlobalStats>(@food_loops_addr)
    }

    #[view]
    public fun get_category_stats(category: String): Option<CategoryStats> {
        if (exists<CategoryStats>(@food_loops_addr)) {
            let stats = borrow_global<CategoryStats>(@food_loops_addr);
            if (stats.category == category) {
                option::some(*stats)
            } else {
                option::none()
            }
        } else {
            option::none()
        }
    }

    #[view]
    public fun get_top_reviews(limit: u64): vector<Review> acquires ReviewStore {
        let review_store = borrow_global<ReviewStore>(@food_loops_addr);
        let top_reviews = vector::empty<Review>();
        let i = 0;
        
        while (i < vector::length(&review_store.reviews) && vector::length(&top_reviews) < limit) {
            let review = vector::borrow(&review_store.reviews, i);
            if (review.helpful_votes > 0) {
                vector::push_back(&mut top_reviews, *review);
            };
            i = i + 1;
        };
        
        top_reviews
    }

    // ======================== Helper Functions ========================

    fun find_review_index(review_store: &ReviewStore, review_id: u64): u64 {
        let i = 0;
        while (i < vector::length(&review_store.reviews)) {
            let review = vector::borrow(&review_store.reviews, i);
            if (review.id == review_id) {
                return i
            };
            i = i + 1;
        };
        vector::length(&review_store.reviews) // Return length if not found
    }

    fun update_average_rating(global_stats: &mut GlobalStats, review_store: &ReviewStore) {
        let total_rating = 0.0;
        let i = 0;
        
        while (i < vector::length(&review_store.reviews)) {
            let review = vector::borrow(&review_store.reviews, i);
            total_rating = total_rating + (review.rating as f64);
            i = i + 1;
        };
        
        global_stats.average_rating = total_rating / (review_store.total_reviews as f64);
    }

    fun update_user_profile(user_address: address, rating: u8, timestamp: u64) {
        if (exists<UserProfile>(user_address)) {
            let profile = borrow_global_mut<UserProfile>(user_address);
            profile.total_reviews = profile.total_reviews + 1;
            profile.last_review_timestamp = timestamp;
            // Update average rating (simplified calculation)
            profile.average_rating_given = ((profile.average_rating_given * ((profile.total_reviews - 1) as f64)) + (rating as f64)) / (profile.total_reviews as f64);
        } else {
            move_to(&account::create_signer_with_capability(&account::create_test_signer_cap(user_address)), UserProfile {
                address: user_address,
                total_reviews: 1,
                average_rating_given: rating as f64,
                helpful_votes_received: 0,
                last_review_timestamp: timestamp,
            });
        };
    }

    // ======================== Test Functions ========================

    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }

    #[test_only]
    public fun create_test_review(
        sender: &signer,
        rating: u8,
        title: String,
        comment: String,
        category: String,
    ) acquires ReviewStore, GlobalStats, UserProfile {
        submit_review(sender, rating, title, comment, category);
    }
}
