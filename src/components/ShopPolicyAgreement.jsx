import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";

const ShopPolicyAgreement = ({ onAgree }) => {
    const [checked, setChecked] = useState(false);

    return (
        <div className="shop-policy-agreement p-3 border rounded bg-light" style={{ maxWidth: 800, margin: "0 auto" }}>
            <h4 className="mb-3 text-center">Chính sách đăng ký Shop trên sàn thương mại điện tử HMall</h4>
            <div style={{ maxHeight: 400, overflowY: "auto", background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #eee" }} className="mb-3">
                <p>
                    <strong>
                        Chính sách này quy định điều kiện và trách nhiệm dành cho người bán ("Shop") khi đăng ký và hoạt động trên sàn thương mại điện tử HMall – nền tảng chuyên dành cho sản phẩm thủ công (handmade). Bằng việc mở shop trên HMall, bạn đồng ý tuân thủ chính sách này và Điều khoản sử dụng của HMall.
                    </strong>
                </p>
                <ol>
                    <li>
                        <strong>Đối tượng và điều kiện đăng ký</strong>
                        <ul>
                            <li>Độ tuổi và năng lực pháp lý: Người bán phải đủ 18 tuổi và có đầy đủ năng lực hành vi dân sự để tham gia giao dịch thương mại điện tử.</li>
                            <li>Thông tin xác thực: Khi đăng ký shop, người bán phải cung cấp thông tin chính xác về tên, địa chỉ, số điện thoại, email và (nếu có) thông tin doanh nghiệp. HMall yêu cầu người bán cung cấp thông tin trung thực và cập nhật để đại diện cho doanh nghiệp của mình</li>
                            <li>Xác minh danh tính: HMall có thể yêu cầu người bán cung cấp giấy tờ pháp lý (CMND/CCCD/hộ chiếu; đăng ký kinh doanh đối với tổ chức) để xác minh nhằm đảm bảo an toàn cho cộng đồng.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Quy định về sản phẩm được phép bán</strong>
                        <ul>
                            <li>Chỉ bán sản phẩm thủ công: HMall chỉ cho phép bán sản phẩm do chính người bán tự làm, thiết kế, hoặc được gia công thủ công. Mọi mặt hàng niêm yết phải được làm, thiết kế, chọn lọc hoặc tự nguồn cung cấp bởi người bán; HMall không cho phép hàng sản xuất hàng loạt, dropshipping hay bán lại.</li>
                            <li>Sản phẩm cấm: Các mặt hàng bất hợp pháp, nguy hiểm, vi phạm quyền sở hữu trí tuệ hoặc nằm trong danh sách cấm của pháp luật Việt Nam và HMall đều bị cấm đăng bán. Những dịch vụ, dự án huy động vốn, thẻ quà tặng hay mã giới thiệu cũng không được phép.</li>
                            <li>Công bố nguồn gốc: Đối với mỗi sản phẩm, người bán phải mô tả cách sản xuất, người thực hiện, nơi xuất xứ và chất liệu. Nếu sử dụng đối tác sản xuất, phải công khai thông tin đối tác. Trường hợp sản phẩm được tạo bằng trí tuệ nhân tạo (AI) hoặc có yếu tố AI, người bán cần ghi rõ trong mô tả.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Quy định về đăng tải sản phẩm</strong>
                        <ul>
                            <li>Mô tả trung thực: Mỗi sản phẩm phải có mô tả chi tiết, chính xác về chất liệu, kích thước, màu sắc và tính năng. HMall nhấn mạnh mô tả chi tiết giúp khách biết rõ sản phẩm mình mua.</li>
                            <li>Hình ảnh rõ ràng: Hình ảnh hoặc video phải do người bán tự chụp; không dùng ảnh stock hoặc ảnh từ nguồn khác. Khuyến khích cung cấp ít nhất 3 hình ảnh (toàn cảnh, góc nghiêng, cận cảnh) để tăng minh bạch.</li>
                            <li>Hàng hóa bị hạn chế: Danh mục sản phẩm bị cấm hoặc hạn chế sẽ được HMall cập nhật thường xuyên, người bán có trách nhiệm tự theo dõi. Các mặt hàng nguy hiểm, chứa chất cấm, thuốc men hay thực phẩm chưa được cấp phép đều không được bán.</li>
                            <li>Không sao chép nội dung: Người bán không được sử dụng mô tả, hình ảnh hoặc tài sản trí tuệ của người khác nếu không có quyền; phải tôn trọng quyền sở hữu trí tuệ.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Phí và phương thức thanh toán</strong>
                        <ul>
                            <li>Phí dịch vụ: HMall thu phí niêm yết và/hoặc hoa hồng trên mỗi giao dịch. Chi tiết mức phí và hình thức thu sẽ được công bố công khai và có thể thay đổi. HMall quy định người bán phải trả phí niêm yết và phí bán hàng.</li>
                            <li>Giá bán minh bạch: Người bán phải niêm yết giá rõ ràng, kèm theo chi phí vận chuyển, thuế hoặc phí khác (nếu có). HMall khuyến cáo người bán cần minh bạch về giá và chi phí bổ sung để tránh gây hiểu lầm cho khách hàng.</li>
                            <li>Phương thức nhận thanh toán: HMall hỗ trợ một số cổng thanh toán (chuyển khoản ngân hàng, ví điện tử...). Người bán cần cung cấp thông tin tài khoản nhận tiền chính xác và chịu trách nhiệm bảo mật.</li>
                            <li>Thuế và nghĩa vụ tài chính: Người bán tự chịu trách nhiệm kê khai, nộp thuế theo quy định của pháp luật. HMall có thể cung cấp báo cáo doanh thu nhưng không chịu trách nhiệm thay người bán thực hiện nghĩa vụ thuế.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Giao hàng và xử lý đơn hàng</strong>
                        <ul>
                            <li>Thời gian xử lý: Người bán phải tuân thủ thời gian xử lý và vận chuyển đã cam kết. HMall yêu cầu người bán tuân thủ thời gian xử lý, gửi hàng kịp thời và thông báo cho khách nếu có sự cố.</li>
                            <li>Phương thức vận chuyển: Người bán có thể sử dụng dịch vụ vận chuyển do HMall cung cấp hoặc tự thỏa thuận. Cần cung cấp mã theo dõi cho khách hàng (nếu có) và đảm bảo bao bì an toàn. HMall nhấn mạnh cần quy định rõ thời gian vận chuyển, phương thức và tiêu chuẩn đóng gói để tránh hư hỏng.</li>
                            <li>Xử lý hàng mất hoặc hỏng: Nếu hàng hóa bị thất lạc hoặc hư hỏng trong quá trình vận chuyển do lỗi đóng gói của người bán, người bán phải chịu trách nhiệm bồi hoàn hoặc gửi lại hàng mới theo thỏa thuận với khách hàng.</li>
                            <li>Huỷ đơn: Nếu không thể hoàn thành đơn hàng, người bán phải thông báo cho khách và hủy đơn. HMall quy định việc hủy đơn cần hoàn tiền cho khách.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Chính sách đổi trả và giải quyết tranh chấp</strong>
                        <ul>
                            <li>Thời hạn đổi trả: Người bán phải công bố rõ ràng thời hạn và điều kiện đổi trả; ít nhất 7 ngày kể từ khi khách nhận hàng (trừ khi sản phẩm tùy chỉnh, đồ ăn, hoặc hàng khó đổi trả). Chính sách phải phù hợp với quy định của pháp luật Việt Nam.</li>
                            <li>Quy trình xử lý khiếu nại: HMall đề xuất xây dựng quy trình giải quyết tranh chấp rõ ràng: người mua và người bán cung cấp bằng chứng (ảnh, tin nhắn), hai bên trao đổi trước khi khiếu nại được escalated. HMall cung cấp kênh hỗ trợ trung gian khi hai bên không tự giải quyết được.</li>
                            <li>Hoàn tiền: Hoàn tiền toàn bộ nếu sản phẩm bị lỗi do người bán hoặc mô tả sai. Trong trường hợp đổi trả do không hợp ý, người bán có thể thu phí vận chuyển lại. Quy định về hoàn tiền phải được niêm yết công khai để khách hàng biết trước.</li>
                            <li>Xử lý vi phạm: HMall có quyền đình chỉ hoặc chấm dứt shop nếu người bán liên tục vi phạm quy định, không giải quyết tranh chấp thỏa đáng hoặc lợi dụng hệ thống phản hồi/hoàn tiền.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Bảo vệ dữ liệu và thông tin cá nhân</strong>
                        <ul>
                            <li>Quyền và nghĩa vụ về dữ liệu: Người bán phải bảo vệ dữ liệu cá nhân của khách hàng theo quy định pháp luật. Hmall yêu cầu người bán tuân thủ các luật bảo vệ dữ liệu, chỉ sử dụng thông tin người mua cho mục đích giao dịch và không gửi thư rác. HMall yêu cầu không thu thập, sử dụng hoặc tiết lộ thông tin khách hàng ngoài phạm vi giao dịch và hỗ trợ khách hàng.</li>
                            <li>Chính sách riêng tư của shop: Người bán nên xây dựng chính sách bảo mật riêng và đăng tải công khai, tương thích với chính sách bảo mật của HMall.</li>
                            <li>Thông tin thanh toán: Người bán không được lưu trữ hoặc sử dụng lại dữ liệu thanh toán của khách hàng nếu không có sự đồng ý rõ ràng và phù hợp với quy định pháp luật.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Trách nhiệm và ứng xử của người bán</strong>
                        <ul>
                            <li>Tuân thủ pháp luật: Người bán chịu trách nhiệm tuân thủ các luật và quy định liên quan (bảo vệ người tiêu dùng, an toàn sản phẩm, thuế, nhãn mác). Sản phẩm phải có các cảnh báo và nhãn phù hợp (nếu cần). HMall không chịu trách nhiệm về tính hợp pháp của sản phẩm.</li>
                            <li>Dịch vụ khách hàng: Người bán cần trả lời tin nhắn trong thời gian hợp lý, giải quyết khiếu nại chuyên nghiệp và giữ thái độ tôn trọng. HMall yêu cầu người bán trả lời tin nhắn kịp thời và giải quyết tranh chấp trước khi yêu cầu sàn can thiệp.</li>
                            <li>Hành vi ứng xử: HMall yêu cầu người bán phải giao tiếp lịch sự, không quấy rối, không spam, không gian lận hoặc thao túng hệ thống. HMall nghiêm cấm hành động gây hại như giả mạo, thao túng số lượt mua, đánh giá ảo, điều chỉnh giá cùng nhau.</li>
                            <li>Không giao dịch ngoài sàn: Người bán không được khuyến khích hoặc thực hiện giao dịch ngoài HMall (off-platform), không được trao đổi thông tin liên lạc cá nhân để thực hiện giao dịch ngoài.</li>
                            <li>Bảo vệ quyền sở hữu trí tuệ: Không đăng bán hàng giả, vi phạm thương hiệu; tôn trọng bản quyền và nhãn hiệu của người khác; HMall sẽ gỡ bỏ sản phẩm vi phạm và áp dụng biện pháp xử lý.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Sửa đổi, đình chỉ và chấm dứt</strong>
                        <ul>
                            <li>Thay đổi chính sách: HMall có quyền cập nhật, bổ sung hoặc thay đổi chính sách này bất cứ lúc nào. Thay đổi sẽ được thông báo trước và người bán tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp thuận các thay đổi.</li>
                            <li>Đình chỉ hoặc chấm dứt hoạt động: HMall có thể đình chỉ hoặc chấm dứt shop nếu người bán vi phạm nghiêm trọng hoặc lặp lại vi phạm, bao gồm bán hàng cấm, gian lận, không cung cấp dịch vụ đúng cam kết, vi phạm pháp luật hoặc gây ảnh hưởng xấu đến cộng đồng. HMall cũng có quyền đình chỉ tài khoản và thu phí chưa thanh toán.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Liên hệ hỗ trợ</strong>
                        <ul>
                            <li>Nếu có thắc mắc hoặc cần hỗ trợ về chính sách, người bán có thể liên hệ bộ phận hỗ trợ của HMall qua email <a href="mailto:hmallcraft@gmail.com">hmallcraft@gmail.com</a> hoặc hệ thống chat trực tuyến trên trang HMall.</li>
                        </ul>
                    </li>
                </ol>
            </div>
            <Form.Check
                type="checkbox"
                id="shop-policy-agree"
                label="Tôi đã đọc, hiểu và đồng ý với Chính sách đăng ký Shop và Điều khoản sử dụng của HMall. Tôi cam kết cung cấp thông tin trung thực và tuân thủ đầy đủ các quy định khi hoạt động trên sàn thương mại điện tử HMall."
                checked={checked}
                onChange={e => setChecked(e.target.checked)}
                className="mb-3"
            />
            <Button
                variant="primary"
                disabled={!checked}
                onClick={onAgree}
                style={{ minWidth: 220 }}
            >
                Đồng ý và tiếp tục
            </Button>
        </div>
    );
};

export default ShopPolicyAgreement;