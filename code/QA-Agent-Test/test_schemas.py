import pytest
from pydantic import ValidationError

from app.schemas import (
    AddressIn, CardIn, CartItemIn, ProductIn, ProfileUpdateIn, RegisterIn, StatusUpdateIn,
)


def reg(**kw):
    d = {"email": "user@example.com", "password": "Passw0rd1", "name": "Test User"}
    d.update(kw)
    return RegisterIn(**d)


def prod(**kw):
    d = {"name": "P", "price": 19.99, "stock": 5, "image_url": "https://x.test/a.png", "category_id": 1}
    d.update(kw)
    return ProductIn(**d)


def addr(**kw):
    d = {"full_name": "Jane Doe", "line1": "1 Main St", "city": "Springfield", "state": "IL",
         "postal_code": "62701", "country": "US", "phone": "5551234567"}
    d.update(kw)
    return AddressIn(**d)


def card(**kw):
    d = {"number": "4242 4242 4242 4242", "expiry": "12/99", "cvc": "123"}
    d.update(kw)
    return CardIn(**d)


def test_utc_07_register_valid():
    m = reg()
    assert m.email == "user@example.com" and m.name == "Test User"


def test_utc_08_password_too_short():
    with pytest.raises(ValidationError):
        reg(password="Ab1")


def test_utc_09_password_too_long():
    with pytest.raises(ValidationError):
        reg(password="a1" * 37)


@pytest.mark.parametrize("pw", ["abcdefgh", "12345678"])
def test_utc_10_password_lacks_digit_or_letter(pw):
    with pytest.raises(ValidationError):
        reg(password=pw)


def test_utc_11_invalid_email():
    with pytest.raises(ValidationError):
        reg(email="not-an-email")


def test_utc_12_empty_name():
    with pytest.raises(ValidationError):
        reg(name="")


def test_utc_13_profile_update_password_rule():
    with pytest.raises(ValidationError):
        ProfileUpdateIn(new_password="short")
    assert ProfileUpdateIn(new_password=None).new_password is None


def test_utc_14_product_valid():
    p = prod()
    assert str(p.price) == "19.99" and p.stock == 5


@pytest.mark.parametrize("price", [0, -1])
def test_utc_15_product_price_must_be_positive(price):
    with pytest.raises(ValidationError):
        prod(price=price)


def test_utc_16_product_price_decimals():
    with pytest.raises(ValidationError):
        prod(price="1.999")


def test_utc_17_product_negative_stock():
    with pytest.raises(ValidationError):
        prod(stock=-1)


def test_utc_18_image_url_scheme():
    with pytest.raises(ValidationError):
        prod(image_url="ftp://x")
    assert prod(image_url="").image_url == ""


@pytest.mark.parametrize("qty", [0, 100])
def test_utc_19_cart_quantity_rejected(qty):
    with pytest.raises(ValidationError):
        CartItemIn(product_id=1, quantity=qty)


@pytest.mark.parametrize("qty", [1, 99])
def test_utc_19_cart_quantity_accepted(qty):
    assert CartItemIn(product_id=1, quantity=qty).quantity == qty


def test_utc_20_address_valid():
    a = addr()
    assert a.postal_code == "62701" and a.phone == "5551234567"


@pytest.mark.parametrize("pc", ["12", "62@01"])
def test_utc_21_address_postal_code_invalid(pc):
    with pytest.raises(ValidationError):
        addr(postal_code=pc)


@pytest.mark.parametrize("ph", ["123", "abc1234567"])
def test_utc_22_phone_invalid(ph):
    with pytest.raises(ValidationError):
        addr(phone=ph)


def test_utc_22_phone_empty_becomes_none_and_valid_accepted():
    assert addr(phone="").phone is None
    assert addr(phone="5551234567").phone == "5551234567"


def test_utc_23_card_number_spaces_stripped():
    assert card().number == "4242424242424242"


def test_utc_23_card_number_short_rejected():
    with pytest.raises(ValidationError):
        card(number="4242")


@pytest.mark.parametrize("exp", ["13/30", "1/30", "2030-01"])
def test_utc_24_card_expiry_format(exp):
    with pytest.raises(ValidationError):
        card(expiry=exp)


def test_utc_25_card_expired_rejected():
    with pytest.raises(ValidationError, match="Card has expired"):
        card(expiry="01/20")


def test_utc_25_card_future_accepted():
    assert card(expiry="12/99").expiry == "12/99"


@pytest.mark.parametrize("cvc", ["12", "12a"])
def test_utc_26_cvc_rejected(cvc):
    with pytest.raises(ValidationError):
        card(cvc=cvc)


@pytest.mark.parametrize("cvc", ["123", "1234"])
def test_utc_26_cvc_accepted(cvc):
    assert card(cvc=cvc).cvc == cvc


def test_utc_27_status_update_literal():
    assert StatusUpdateIn(status="shipped").status == "shipped"
    with pytest.raises(ValidationError):
        StatusUpdateIn(status="paid")
