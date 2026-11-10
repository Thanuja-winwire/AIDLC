# Requirement Traceability Matrix — E-commerce Store (FastAPI backend)

| ID | Linked Requirement | Automation Script | Execution Result | Defect |
|----|---------------------|--------------------|--------------------|--------|
| UTC-01 | — | code/QA-Agent-Test/test_security.py::test_utc_01_password_hash_round_trip | PASS | — |
| UTC-02 | — | code/QA-Agent-Test/test_security.py::test_utc_02_wrong_password_rejected | PASS | — |
| UTC-03 | — | code/QA-Agent-Test/test_security.py::test_utc_03_malformed_hash_returns_false | PASS | — |
| UTC-04 | — | code/QA-Agent-Test/test_security.py::test_utc_04_token_encode_decode | PASS | — |
| UTC-05 | — | code/QA-Agent-Test/test_security.py::test_utc_05_invalid_token_returns_none | PASS | — |
| UTC-06 | — | code/QA-Agent-Test/test_security.py::test_utc_06_expired_token_returns_none | PASS | — |
| UTC-07 | — | code/QA-Agent-Test/test_schemas.py::test_utc_07_register_valid | PASS | — |
| UTC-08 | — | code/QA-Agent-Test/test_schemas.py::test_utc_08_password_too_short | PASS | — |
| UTC-09 | — | code/QA-Agent-Test/test_schemas.py::test_utc_09_password_too_long | PASS | — |
| UTC-10 | — | code/QA-Agent-Test/test_schemas.py::test_utc_10_password_lacks_digit_or_letter | PASS | — |
| UTC-11 | — | code/QA-Agent-Test/test_schemas.py::test_utc_11_invalid_email | PASS | — |
| UTC-12 | — | code/QA-Agent-Test/test_schemas.py::test_utc_12_empty_name | PASS | — |
| UTC-13 | — | code/QA-Agent-Test/test_schemas.py::test_utc_13_profile_update_password_rule | PASS | — |
| UTC-14 | — | code/QA-Agent-Test/test_schemas.py::test_utc_14_product_valid | PASS | — |
| UTC-15 | — | code/QA-Agent-Test/test_schemas.py::test_utc_15_product_price_must_be_positive | PASS | — |
| UTC-16 | — | code/QA-Agent-Test/test_schemas.py::test_utc_16_product_price_decimals | PASS | — |
| UTC-17 | — | code/QA-Agent-Test/test_schemas.py::test_utc_17_product_negative_stock | PASS | — |
| UTC-18 | — | code/QA-Agent-Test/test_schemas.py::test_utc_18_image_url_scheme | PASS | — |
| UTC-19 | — | code/QA-Agent-Test/test_schemas.py::test_utc_19_cart_quantity_rejected / _accepted | PASS | — |
| UTC-20 | — | code/QA-Agent-Test/test_schemas.py::test_utc_20_address_valid | PASS | — |
| UTC-21 | — | code/QA-Agent-Test/test_schemas.py::test_utc_21_address_postal_code_invalid | PASS | — |
| UTC-22 | — | code/QA-Agent-Test/test_schemas.py::test_utc_22_phone_invalid / test_utc_22_phone_empty_becomes_none_and_valid_accepted | PASS | — |
| UTC-23 | — | code/QA-Agent-Test/test_schemas.py::test_utc_23_card_number_spaces_stripped / _short_rejected | PASS | — |
| UTC-24 | — | code/QA-Agent-Test/test_schemas.py::test_utc_24_card_expiry_format | PASS | — |
| UTC-25 | — | code/QA-Agent-Test/test_schemas.py::test_utc_25_card_expired_rejected / _future_accepted | PASS | — |
| UTC-26 | — | code/QA-Agent-Test/test_schemas.py::test_utc_26_cvc_rejected / _accepted | PASS | — |
| UTC-27 | — | code/QA-Agent-Test/test_schemas.py::test_utc_27_status_update_literal | PASS | — |
| UTC-28 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_28_tax_calculation | PASS | — |
| UTC-29 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_29_tax_rounding_half_up | PASS | — |
| UTC-30 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_30_cart_view_totals | PASS | — |
| UTC-31 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_31_cart_view_excludes_inactive | PASS | — |
| UTC-32 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_32_get_or_create_cart_reuses | PASS | — |
| UTC-33 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_33_add_item_new | PASS | — |
| UTC-34 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_34_add_item_merges | PASS | — |
| UTC-35 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_35_add_item_missing_product / _inactive_product | PASS | — |
| UTC-36 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_36_add_item_over_stock | PASS | — |
| UTC-37 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_37_add_item_over_99 | PASS | — |
| UTC-38 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_38_update_item_qty | PASS | — |
| UTC-39 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_39_update_item_over_stock | PASS | — |
| UTC-40 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_40_update_unknown_item / _remove_unknown_item / _other_users_item | PASS | — |
| UTC-41 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_41_remove_item | PASS | — |
| UTC-42 | — | code/QA-Agent-Test/test_cart_service.py::test_utc_42_clear_cart | PASS | — |
| UTC-43 | — | code/QA-Agent-Test/test_payment_gateway.py::test_utc_43_mock_gateway_success | PASS | — |
| UTC-44 | — | code/QA-Agent-Test/test_payment_gateway.py::test_utc_44_mock_gateway_decline | PASS | — |
| UTC-45 | — | code/QA-Agent-Test/test_payment_gateway.py::test_utc_45_mock_gateway_invalid_card | PASS | — |
| UTC-46 | — | code/QA-Agent-Test/test_order_service.py::test_utc_46_place_order_success | PASS | — |
| UTC-47 | — | code/QA-Agent-Test/test_order_service.py::test_utc_47_place_order_empty_cart | PASS | — |
| UTC-48 | — | code/QA-Agent-Test/test_order_service.py::test_utc_48_place_order_unavailable_item | PASS | — |
| UTC-49 | — | code/QA-Agent-Test/test_order_service.py::test_utc_49_place_order_insufficient_stock | PASS | — |
| UTC-50 | — | code/QA-Agent-Test/test_order_service.py::test_utc_50_pay_success | PASS | — |
| UTC-51 | — | code/QA-Agent-Test/test_order_service.py::test_utc_51_pay_declined | PASS | — |
| UTC-52 | — | code/QA-Agent-Test/test_order_service.py::test_utc_52_retry_payment_after_failure | PASS | — |
| UTC-53 | — | code/QA-Agent-Test/test_order_service.py::test_utc_53_pay_invalid_status | PASS | — |
| UTC-54 | — | code/QA-Agent-Test/test_order_service.py::test_utc_54_order_ownership | PASS | — |
| UTC-55 | — | code/QA-Agent-Test/test_order_service.py::test_utc_55_list_orders_pagination | PASS | — |
| UTC-56 | — | code/QA-Agent-Test/test_order_service.py::test_utc_56_customer_cancel_restores_stock | PASS | — |
| UTC-57 | — | code/QA-Agent-Test/test_order_service.py::test_utc_57_customer_cancel_not_allowed | PASS | — |
| UTC-58 | — | code/QA-Agent-Test/test_order_service.py::test_utc_58_admin_forward_transitions | PASS | — |
| UTC-59 | — | code/QA-Agent-Test/test_order_service.py::test_utc_59_admin_invalid_transition | PASS | — |
| UTC-60 | — | code/QA-Agent-Test/test_order_service.py::test_utc_60_admin_cancel_allowed / _rejected | PASS | — |
| UTC-61 | — | code/QA-Agent-Test/test_order_service.py::test_utc_61_admin_list_filter | PASS | — |
| UTC-62 | — | code/QA-Agent-Test/test_order_service.py::test_utc_62_admin_get_missing_order | PASS | — |
