from sowaanerp_subscription.sowaanerp_subscription.quota import (validate_db_space_limit,
                                               validate_files_space_limit)


def daily():
    validate_files_space_limit()
    validate_db_space_limit()
