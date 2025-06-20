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
}
