#[test_only]
module food_loops_addr::test_end_to_end {
    use std::string;

    use food_loops_addr::food_loops;

    #[test(sender = @food_loops_addr)]
    fun test_end_to_end(sender: &signer) {
        food_loops::init_module_for_test(sender);

        food_loops::post_message(sender, string::utf8(b"hello world"));

        let string_content = food_loops::get_message_content();
        assert!(string_content == string::utf8(b"hello world"), 3);

        // Post again, should overwrite the old message
        food_loops::post_message(sender, string::utf8(b"hello aptos"));

        let string_content = food_loops::get_message_content();
        assert!(string_content == string::utf8(b"hello aptos"), 16);
    }

    #[test(sender = @food_loops_addr)]
    fun test_review_submission(sender: &signer) {
        food_loops::init_module_for_test(sender);

        // Submit a review
        food_loops::submit_review(
            sender,
            5,
            string::utf8(b"Amazing food waste reduction!"),
            string::utf8(b"This platform really helps reduce food waste effectively."),
            string::utf8(b"restaurant")
        );

        // Get the review and verify
        let reviews = food_loops::get_all_reviews();
        assert!(std::vector::length(&reviews) == 1, 1);

        let review = std::vector::borrow(&reviews, 0);
        assert!(review.rating == 5, 2);
        assert!(review.title == string::utf8(b"Amazing food waste reduction!"), 3);
        assert!(review.category == string::utf8(b"restaurant"), 4);
    }

    #[test(sender = @food_loops_addr)]
    fun test_multiple_reviews(sender: &signer) {
        food_loops::init_module_for_test(sender);

        // Submit multiple reviews
        food_loops::submit_review(
            sender,
            4,
            string::utf8(b"Good service"),
            string::utf8(b"Fast delivery and fresh food."),
            string::utf8(b"delivery")
        );

        food_loops::submit_review(
            sender,
            3,
            string::utf8(b"Average experience"),
            string::utf8(b"Food was okay but could be better."),
            string::utf8(b"restaurant")
        );

        // Verify total reviews
        let reviews = food_loops::get_all_reviews();
        assert!(std::vector::length(&reviews) == 2, 5);

        // Test category filtering
        let restaurant_reviews = food_loops::get_reviews_by_category(string::utf8(b"restaurant"));
        assert!(std::vector::length(&restaurant_reviews) == 1, 6);

        let delivery_reviews = food_loops::get_reviews_by_category(string::utf8(b"delivery"));
        assert!(std::vector::length(&delivery_reviews) == 1, 7);
    }

    #[test(sender = @food_loops_addr)]
    fun test_review_voting(sender: &signer) {
        food_loops::init_module_for_test(sender);

        // Submit a review
        food_loops::submit_review(
            sender,
            5,
            string::utf8(b"Helpful review"),
            string::utf8(b"This review is very helpful."),
            string::utf8(b"grocery")
        );

        // Vote on the review as helpful
        food_loops::vote_review_helpful(sender, 1);

        // Verify the vote was recorded
        let reviews = food_loops::get_all_reviews();
        let review = std::vector::borrow(&reviews, 0);
        assert!(review.helpful_votes == 1, 8);
    }

    #[test(sender = @food_loops_addr)]
    fun test_review_reporting(sender: &signer) {
        food_loops::init_module_for_test(sender);

        // Submit a review
        food_loops::submit_review(
            sender,
            1,
            string::utf8(b"Bad review"),
            string::utf8(b"This is inappropriate content."),
            string::utf8(b"restaurant")
        );

        // Report the review
        food_loops::report_review(sender, 1);

        // Verify the review was reported
        let reviews = food_loops::get_all_reviews();
        let review = std::vector::borrow(&reviews, 0);
        assert!(review.reported == true, 9);
    }

    #[test(sender = @food_loops_addr)]
    fun test_global_stats(sender: &signer) {
        food_loops::init_module_for_test(sender);

        // Submit a review
        food_loops::submit_review(
            sender,
            4,
            string::utf8(b"Test review"),
            string::utf8(b"Testing global stats."),
            string::utf8(b"restaurant")
        );

        // Get global stats
        let stats = food_loops::get_global_stats();
        assert!(stats.total_reviews == 1, 10);
        assert!(stats.average_rating == 4.0, 11);
        assert!(std::vector::length(&stats.categories) == 1, 12);
    }

    #[test(sender = @food_loops_addr)]
    fun test_recent_reviews(sender: &signer) {
        food_loops::init_module_for_test(sender);

        // Submit multiple reviews
        food_loops::submit_review(
            sender,
            5,
            string::utf8(b"First review"),
            string::utf8(b"This is the first review."),
            string::utf8(b"restaurant")
        );

        food_loops::submit_review(
            sender,
            4,
            string::utf8(b"Second review"),
            string::utf8(b"This is the second review."),
            string::utf8(b"delivery")
        );

        // Get recent reviews (limit 1)
        let recent_reviews = food_loops::get_recent_reviews(1);
        assert!(std::vector::length(&recent_reviews) == 1, 13);

        let recent_review = std::vector::borrow(&recent_reviews, 0);
        assert!(recent_review.title == string::utf8(b"Second review"), 14);
    }

    #[test(sender = @food_loops_addr)]
    fun test_user_profile(sender: &signer) {
        food_loops::init_module_for_test(sender);

        let sender_addr = std::signer::address_of(sender);

        // Submit a review
        food_loops::submit_review(
            sender,
            5,
            string::utf8(b"Profile test"),
            string::utf8(b"Testing user profile."),
            string::utf8(b"restaurant")
        );

        // Get user profile
        let profile_opt = food_loops::get_user_profile(sender_addr);
        assert!(std::option::is_some(&profile_opt), 15);

        let profile = std::option::borrow(&profile_opt);
        assert!(profile.total_reviews == 1, 16);
        assert!(profile.average_rating_given == 5.0, 17);
    }
}
