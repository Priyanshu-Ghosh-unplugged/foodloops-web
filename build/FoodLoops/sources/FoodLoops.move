module food_loops_addr::FoodLoops {
    use std::string::{String, length};
    use std::vector;
    use std::option::{Self, Option};
    use std::signer;
    use std::timestamp;

    // ======================== Data Structures ========================

    struct Review has store, drop {
        id: u64,
        user_address: address,
        rating: u8,
        title: String,
        comment: String,
        category: String,
        timestamp: u64,
        helpful_votes: u64,
        reported: bool,
    }

    struct ReviewStore has key {
        reviews: vector<Review>,
        next_review_id: u64,
        total_reviews: u64,
        average_rating_x100: u64,
    }

    struct UserProfile has key {
        address: address,
        total_reviews: u64,
        average_rating_given_x100: u64,
        helpful_votes_received: u64,
        last_review_timestamp: u64,
    }

    struct GlobalStats has key, store, drop, copy {
        total_reviews: u64,
        total_users: u64,
        average_rating_x100: u64,
        categories: vector<String>,
    }

    struct ReviewView has copy, drop, store {
        id: u64,
        user_address: address,
        rating: u8,
        title: String,
        comment: String,
        category: String,
        timestamp: u64,
        helpful_votes: u64,
        reported: bool,
    }

    struct UserProfileView has copy, drop, store {
        address: address,
        total_reviews: u64,
        average_rating_given_x100: u64,
        helpful_votes_received: u64,
        last_review_timestamp: u64,
    }

    struct UserRewards has key {
        available_points: u64,
        total_earned: u64,
    }

    struct Reward has copy, drop, store {
        id: u64,
        name: String,
        cost: u64,
    }

    struct RewardCatalog has key {
        rewards: vector<Reward>,
        next_id: u64,
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
    const ERROR_REWARD_NOT_FOUND: u64 = 101;
    const ERROR_INSUFFICIENT_POINTS: u64 = 102;

    // ======================== Initialization ========================

    fun init_module(sender: &signer) {
        move_to(sender, GlobalStats {
            total_reviews: 0,
            total_users: 0,
            average_rating_x100: 0,
            categories: vector::empty(),
        });
        move_to(sender, ReviewStore {
            reviews: vector::empty(),
            next_review_id: 1,
            total_reviews: 0,
            average_rating_x100: 0,
        });
        move_to(sender, RewardCatalog {
            rewards: vector::empty(),
            next_id: 1,
        });
    }

    // ======================== Entry Functions ========================

    public entry fun submit_review(
        sender: &signer,
        rating: u8,
        title: String,
        comment: String,
        category: String,
    ) acquires ReviewStore, GlobalStats, UserProfile {
        let sender_addr = signer::address_of(sender);
        assert!(rating >= MIN_RATING && rating <= MAX_RATING, ERROR_INVALID_RATING);
        assert!(length(&title) <= MAX_TITLE_LENGTH, ERROR_INVALID_TITLE);
        assert!(length(&comment) <= MAX_COMMENT_LENGTH, ERROR_INVALID_COMMENT);
        assert!(length(&category) <= MAX_CATEGORY_LENGTH, ERROR_INVALID_CATEGORY);

        let review_store = borrow_global_mut<ReviewStore>(@food_loops_addr);
        let global_stats = borrow_global_mut<GlobalStats>(@food_loops_addr);
        let review_id = review_store.next_review_id;
        let current_timestamp = timestamp::now_seconds();

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

        vector::push_back(&mut review_store.reviews, new_review);
        review_store.next_review_id += 1;
        review_store.total_reviews += 1;
        global_stats.total_reviews += 1;
        update_average_rating_x100(global_stats, review_store);

        if (!vector::contains(&global_stats.categories, &category)) {
            vector::push_back(&mut global_stats.categories, category);
        };
        update_user_profile_x100(sender, sender_addr, rating, current_timestamp);
    }

    public entry fun vote_review_helpful(
        _sender: &signer,
        review_id: u64,
    ) acquires ReviewStore {
        let review_store = borrow_global_mut<ReviewStore>(@food_loops_addr);
        let review_index = find_review_index(review_store, review_id);
        assert!(review_index < vector::length(&review_store.reviews), ERROR_REVIEW_NOT_FOUND);
        let review = vector::borrow_mut(&mut review_store.reviews, review_index);
        review.helpful_votes += 1;
    }

    public entry fun report_review(
        _sender: &signer,
        review_id: u64,
    ) acquires ReviewStore {
        let review_store = borrow_global_mut<ReviewStore>(@food_loops_addr);
        let review_index = find_review_index(review_store, review_id);
        assert!(review_index < vector::length(&review_store.reviews), ERROR_REVIEW_NOT_FOUND);
        let review = vector::borrow_mut(&mut review_store.reviews, review_index);
        assert!(!review.reported, ERROR_REVIEW_ALREADY_REPORTED);
        review.reported = true;
    }

    public entry fun register_user_rewards(sender: &signer) {
        if (!exists<UserRewards>(signer::address_of(sender))) {
            move_to(sender, UserRewards { available_points: 0, total_earned: 0 });
        }
    }

    public entry fun redeem_reward(
        sender: &signer,
        reward_id: u64
    ) acquires UserRewards, RewardCatalog {
        let user_addr = signer::address_of(sender);
        let rewards = borrow_global_mut<UserRewards>(user_addr);
        let catalog = borrow_global<RewardCatalog>(@food_loops_addr);
        let reward_index = find_reward_index(catalog, reward_id);
        assert!(reward_index < vector::length(&catalog.rewards), ERROR_REWARD_NOT_FOUND);
        let reward = vector::borrow(&catalog.rewards, reward_index);
        assert!(rewards.available_points >= reward.cost, ERROR_INSUFFICIENT_POINTS);
        rewards.available_points -= reward.cost;
    }

    // ======================== Admin Functions ========================

    public entry fun add_reward(
        sender: &signer,
        name: String,
        cost: u64
    ) acquires RewardCatalog {
        assert!(signer::address_of(sender) == @food_loops_addr, ERROR_UNAUTHORIZED);
        let catalog = borrow_global_mut<RewardCatalog>(@food_loops_addr);
        let new_id = catalog.next_id;
        vector::push_back(&mut catalog.rewards, Reward { id: new_id, name, cost });
        catalog.next_id += 1;
    }

    /// Grant points to a user. Only the contract admin can call this.
    public entry fun grant_points(
        sender: &signer,
        user_address: address,
        points: u64
    ) acquires UserRewards {
        assert!(signer::address_of(sender) == @food_loops_addr, ERROR_UNAUTHORIZED);
        // A more specific error like E_USER_NOT_REGISTERED would be better here.
        assert!(exists<UserRewards>(user_address), ERROR_REVIEW_NOT_FOUND);
        
        let user_rewards = borrow_global_mut<UserRewards>(user_address);
        user_rewards.available_points = user_rewards.available_points + points;
        user_rewards.total_earned = user_rewards.total_earned + points;
    }
    
    // ======================== View Functions ========================

    #[view]
    public fun get_review_by_id(review_id: u64): Option<ReviewView> acquires ReviewStore {
        let review_store = borrow_global<ReviewStore>(@food_loops_addr);
        let i = find_review_index(review_store, review_id);
        if (i < vector::length(&review_store.reviews)) {
            option::some(view_from_review(vector::borrow(&review_store.reviews, i)))
        } else {
            option::none()
        }
    }

    #[view]
    public fun get_all_reviews(): vector<ReviewView> acquires ReviewStore {
        let reviews = &borrow_global<ReviewStore>(@food_loops_addr).reviews;
        let review_views = vector::empty();
        let i = 0;
        while (i < vector::length(reviews)) {
            vector::push_back(&mut review_views, view_from_review(vector::borrow(reviews, i)));
            i += 1;
        };
        review_views
    }

    #[view]
    public fun get_user_profile(user_addr: address): Option<UserProfileView> acquires UserProfile {
        if (exists<UserProfile>(user_addr)) {
            let p = borrow_global<UserProfile>(user_addr);
            option::some(UserProfileView {
                address: p.address,
                total_reviews: p.total_reviews,
                average_rating_given_x100: p.average_rating_given_x100,
                helpful_votes_received: p.helpful_votes_received,
                last_review_timestamp: p.last_review_timestamp,
            })
        } else {
            option::none()
        }
    }
    
    #[view]
    public fun get_global_stats(): GlobalStats acquires GlobalStats {
        *borrow_global<GlobalStats>(@food_loops_addr)
    }

    /// Get user points (available, total earned).
    #[view]
    public fun get_user_rewards(user: address): (u64, u64) acquires UserRewards {
        if (exists<UserRewards>(user)) {
            let ur = borrow_global<UserRewards>(user);
            (ur.available_points, ur.total_earned)
        } else {
            (0, 0)
        }
    }

    /// Get all available rewards.
    #[view]
    public fun get_rewards(): vector<Reward> acquires RewardCatalog {
        borrow_global<RewardCatalog>(@food_loops_addr).rewards
    }

    // ======================== Helper Functions ========================

    fun find_review_index(store: &ReviewStore, id: u64): u64 {
        let i = 0;
        while (i < vector::length(&store.reviews)) {
            if (vector::borrow(&store.reviews, i).id == id) return i;
            i += 1;
        };
        i
    }
    
    fun find_reward_index(catalog: &RewardCatalog, id: u64): u64 {
        let i = 0;
        while (i < vector::length(&catalog.rewards)) {
            if (vector::borrow(&catalog.rewards, i).id == id) return i;
            i += 1;
        };
        i
    }

    fun update_average_rating_x100(stats: &mut GlobalStats, store: &ReviewStore) {
        if (store.total_reviews > 0) {
            let total_rating: u64 = 0;
            let i = 0;
            while (i < vector::length(&store.reviews)) {
                total_rating += vector::borrow(&store.reviews, i).rating as u64;
                i += 1;
            };
            stats.average_rating_x100 = (total_rating * 100) / store.total_reviews;
        }
    }

    fun update_user_profile_x100(
        sender: &signer,
        addr: address,
        rating: u8,
        time: u64,
    ) acquires UserProfile {
        if (!exists<UserProfile>(addr)) {
            move_to(sender, UserProfile {
                address: addr,
                total_reviews: 1,
                average_rating_given_x100: (rating as u64) * 100,
                helpful_votes_received: 0,
                last_review_timestamp: time,
            });
        } else {
            let p = borrow_global_mut<UserProfile>(addr);
            let old_total_rating = (p.average_rating_given_x100 * p.total_reviews) / 100;
            p.total_reviews += 1;
            p.average_rating_given_x100 = ((old_total_rating + (rating as u64)) * 100) / p.total_reviews;
            p.last_review_timestamp = time;
        }
    }

    fun view_from_review(r: &Review): ReviewView {
        ReviewView {
            id: r.id,
            user_address: r.user_address,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            category: r.category,
            timestamp: r.timestamp,
            helpful_votes: r.helpful_votes,
            reported: r.reported,
        }
    }
}