import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { HistoryService } from 'admin/history/history.service';
import { Observable, tap } from 'rxjs';

@Injectable()
export class HistoryLogInterceptor implements NestInterceptor {
  constructor(private readonly historyService: HistoryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip } = request;

    const getModuleFromUrl = (url: string): string => {
      if (url.includes('admin/category')) return 'Danh mục';
      if (url.includes('admin/product')) return 'Sản phẩm';
      if (url.includes('admin/brand')) return 'Thương hiệu';
      if (url.includes('admin/user')) return 'Người dùng';
      if (url.includes('admin/order')) return 'Đơn hàng';
      return 'Hệ thống';
    };

    const actionMap = {
      POST: 'tạo mới',
      PUT: 'cập nhật',
      PATCH: 'chỉnh sửa',
      DELETE: 'xóa',
    };

    return next.handle().pipe(
      tap(() => {
        if (!user || !actionMap[method]) return;

        const adminName = user.username || user.name || 'Quản trị viên';

        // Kiểm tra body có chứa key là password không. Nếu có thì che đi bằng ****
        if (body && body.password) {
          body.password = '****';
        }

        this.historyService.createLog({
          adminId: user._id || user.id || user.IDEmp || user.sub,
          adminName,
          path: url,
          method: method,
          body: body,
          description: `${adminName} đã ${actionMap[method]} dữ liệu tại ${url}`,
        });
      }),
    );
  }
}
